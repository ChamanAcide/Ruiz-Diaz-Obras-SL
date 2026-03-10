class ImageCompare extends HTMLElement {
    connectedCallback() {
        // On mobile/slow connections, Custom Elements can be upgraded before their innerHTML is fully parsed.
        // We wait a tick or for DOMContentLoaded to ensure children (<img>) are available.
        const init = () => {
            if (this.initialized) return;
            this.images = Array.from(this.querySelectorAll('img'));
            
            if (this.images.length < 2) {
                // If still not enough images, maybe they are being injected later or are not parsed yet
                setTimeout(() => {
                    if (this.initialized) return;
                    this.images = Array.from(this.querySelectorAll('img'));
                    if (this.images.length >= 2) {
                        this.initialized = true;
                        this.setup();
                    }
                }, 150);
                return;
            }
            
            this.initialized = true;
            this.setup();
        };

        if (document.readyState === 'loading') {
            window.addEventListener('DOMContentLoaded', init);
        } else {
            // Use requestAnimationFrame to let the parser finish the current block
            requestAnimationFrame(init);
        }
    }
    
    setup() {
        this.innerHTML = '';
        this.classList.add('block', 'relative', 'overflow-hidden', 'rounded-3xl', 'shadow-2xl', 'w-full', 'bg-slate-200');
        this.style.aspectRatio = '16/10'; 
        
        this.handles = [];
        const numOverlays = this.images.length - 1;
        
        // Base image (last one corresponds to the final layer underneath)
        const baseImg = this.images[this.images.length - 1];
        baseImg.className = 'absolute top-0 left-0 w-full h-full object-cover pointer-events-none';
        this.appendChild(baseImg);
        baseImg.labelElement = this.createLabel(baseImg, 'right');
        
        // Render overlays
        for (let i = 0; i < numOverlays; i++) {
            const img = this.images[i];
            img.className = 'absolute top-0 left-0 w-full h-full object-cover pointer-events-none';
            img.style.zIndex = numOverlays - i;
            this.appendChild(img);
            
            if (i === 0) {
                img.labelElement = this.createLabel(img, 'left');
            } else {
                img.labelElement = this.createLabel(img, 'center', i, numOverlays);
            }
            
            // initial positions: left-to-right distribution
            const initPos = ((i + 1) / (numOverlays + 1)) * 100;
            
            const handle = document.createElement('div');
            // Expanded hit area (w-12 is 48px) to make grabbing easy on mobile
            handle.className = 'absolute top-0 bottom-0 w-12 cursor-ew-resize flex items-center justify-center';
            handle.style.left = `${initPos}%`;
            handle.style.transform = 'translateX(-50%)';
            handle.style.zIndex = 10 + numOverlays - i;
            handle.style.userSelect = 'none';
            handle.style.touchAction = 'none';
            
            const line = document.createElement('div');
            line.className = 'absolute top-0 bottom-0 w-1 bg-white pointer-events-none';
            line.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
            
            const handleBtn = document.createElement('div');
            handleBtn.className = 'absolute z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.25)] ring-4 ring-white/50 border border-slate-200 transition-transform active:scale-95 pointer-events-none';
            handleBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a192f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l-6-6 6-6M15 6l6 6-6 6"/></svg>';
            handleBtn.style.userSelect = 'none';
            
            handle.appendChild(line);
            handle.appendChild(handleBtn);
            this.appendChild(handle);
            
            this.handles.push({ handle, img, pos: initPos, index: i });
        }
        
        this.updateClips();
        
        let activeHandle = null;
        
        const attachDrag = (handleObj) => {
            const down = (e) => {
                if (e.type === 'touchstart' && e.cancelable) {
                    e.preventDefault();
                } else if (e.type === 'mousedown') {
                    e.preventDefault();
                }
                activeHandle = handleObj;
            };
            handleObj.handle.addEventListener('mousedown', down);
            handleObj.handle.addEventListener('touchstart', down, { passive: false });
        };
        
        this.handles.forEach(attachDrag);
        
        const move = (e) => {
            if (!activeHandle) return;
            const rect = this.getBoundingClientRect();
            let clientX;
            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
            } else if (e.clientX !== undefined) {
                clientX = e.clientX;
            } else {
                return;
            }
            
            let x = clientX - rect.left;
            let pos = (x / rect.width) * 100;
            pos = Math.max(0, Math.min(100, pos));
            
            activeHandle.pos = pos;
            
            // Sort by index so i=0 is evaluated before i=1
            this.handles.sort((a, b) => a.index - b.index);
            for (let j = 0; j < this.handles.length - 1; j++) {
                if (this.handles[j].pos > this.handles[j+1].pos) {
                    if (activeHandle === this.handles[j]) {
                        this.handles[j].pos = this.handles[j+1].pos;
                    } else {
                        this.handles[j+1].pos = this.handles[j].pos;
                    }
                }
            }
            
            this.updateClips();
        };
        
        const up = () => { activeHandle = null; };
        
        document.addEventListener('mousemove', move);
        document.addEventListener('touchmove', move, { passive: false });
        document.addEventListener('mouseup', up);
        document.addEventListener('touchend', up);
        document.addEventListener('touchcancel', up);
    }
    
    updateClips() {
        this.handles.forEach(obj => {
            obj.handle.style.left = `${obj.pos}%`;
            obj.img.style.clipPath = `polygon(0 0, ${obj.pos}% 0, ${obj.pos}% 100%, 0 100%)`;
            obj.img.style.webkitClipPath = `polygon(0 0, ${obj.pos}% 0, ${obj.pos}% 100%, 0 100%)`;
        });
        this.updateActiveLabel();
    }
    
    updateActiveLabel() {
        const numOverlays = this.images.length - 1;
        const widths = [];
        
        for (let i = 0; i <= numOverlays; i++) {
            const startX = i === 0 ? 0 : this.handles.find(h => h.index === i - 1).pos;
            const endX = i === numOverlays ? 100 : this.handles.find(h => h.index === i).pos;
            widths.push({ index: i, width: endX - startX, img: this.images[i] });
        }
        
        let maxIndex = 0;
        let maxWidth = -1;
        widths.forEach(item => {
            if (item.width > maxWidth) {
                maxWidth = item.width;
                maxIndex = item.index;
            }
        });
        
        this.images.forEach((img, idx) => {
            if (!img.labelElement) return;
            if (idx === maxIndex) {
                img.labelElement.className = 'px-4 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[11px] font-bold tracking-[0.2em] uppercase whitespace-nowrap border transition-all duration-300 backdrop-blur-md bg-accent text-white border-accent scale-105 opacity-100 shadow-[0_4px_20px_rgba(212,175,55,0.4)]';
            } else {
                img.labelElement.className = 'px-4 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[11px] font-bold tracking-[0.2em] uppercase whitespace-nowrap border transition-all duration-300 backdrop-blur-md bg-midnight/85 text-white border-white/10 scale-90 opacity-60 shadow-[0_8px_30px_rgb(0,0,0,0.12)]';
            }
        });
    }
    
    createLabel(img, position, index, numOverlays) {
        const labelText = img.dataset.label;
        if (!labelText) return null;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'absolute top-4 sm:top-6 z-20 pointer-events-none transition-all duration-300';
        
        const label = document.createElement('div');
        label.className = 'px-4 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[11px] font-bold tracking-[0.2em] uppercase whitespace-nowrap border transition-all duration-300 backdrop-blur-md bg-midnight/85 text-white border-white/10 scale-90 opacity-60 shadow-[0_8px_30px_rgb(0,0,0,0.12)]';
        label.textContent = labelText;
        
        wrapper.appendChild(label);

        if (position === 'left') {
            wrapper.style.left = '1rem';
            label.style.transformOrigin = 'left top';
        } else if (position === 'right') {
            wrapper.style.right = '1rem';
            label.style.transformOrigin = 'right top';
        } else {
            if (numOverlays > 1 && index !== undefined) {
                const pct = (index / numOverlays) * 100;
                wrapper.style.left = `${pct}%`;
            } else {
                wrapper.style.left = '50%';
            }
            wrapper.style.transform = 'translateX(-50%)';
            label.style.transformOrigin = 'center top';
        }
        this.appendChild(wrapper);
        return label;
    }
}

customElements.define('image-compare', ImageCompare);
