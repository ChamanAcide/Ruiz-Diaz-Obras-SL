class ImageCompare extends HTMLElement {
    connectedCallback() {
        this.images = Array.from(this.querySelectorAll('img'));
        if (this.images.length < 2) return;
        
        this.innerHTML = '';
        this.classList.add('block', 'relative', 'overflow-hidden', 'rounded-3xl', 'shadow-2xl', 'w-full', 'bg-slate-200');
        this.style.aspectRatio = '16/10'; 
        
        this.handles = [];
        const numOverlays = this.images.length - 1;
        
        // Base image (last one corresponds to the final layer underneath)
        const baseImg = this.images[this.images.length - 1];
        baseImg.className = 'absolute top-0 left-0 w-full h-full object-cover pointer-events-none';
        this.appendChild(baseImg);
        this.createLabel(baseImg, 'right');
        
        // Render overlays
        for (let i = 0; i < numOverlays; i++) {
            const img = this.images[i];
            img.className = 'absolute top-0 left-0 w-full h-full object-cover pointer-events-none';
            img.style.zIndex = numOverlays - i;
            this.appendChild(img);
            
            if (i === 0) {
                this.createLabel(img, 'left');
            }
            
            // initial positions: left-to-right distribution
            const initPos = ((i + 1) / (numOverlays + 1)) * 100;
            
            const handle = document.createElement('div');
            handle.className = 'absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center';
            handle.style.left = `${initPos}%`;
            handle.style.transform = 'translateX(-50%)';
            handle.style.zIndex = 10 + numOverlays - i;
            handle.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
            handle.style.userSelect = 'none';
            handle.style.touchAction = 'none';
            
            const handleBtn = document.createElement('div');
            handleBtn.className = 'absolute w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.25)] ring-4 ring-white/50 border border-slate-200 transition-transform active:scale-95';
            handleBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a192f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l-6-6 6-6M15 6l6 6-6 6"/></svg>';
            handleBtn.style.userSelect = 'none';
            handleBtn.style.pointerEvents = 'none';
            
            handle.appendChild(handleBtn);
            this.appendChild(handle);
            
            this.handles.push({ handle, img, pos: initPos, index: i });
        }
        
        this.updateClips();
        
        let activeHandle = null;
        
        const attachDrag = (handleObj) => {
            const down = (e) => {
                e.preventDefault();
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
    }
    
    updateClips() {
        this.handles.forEach(obj => {
            obj.handle.style.left = `${obj.pos}%`;
            obj.img.style.clipPath = `polygon(0 0, ${obj.pos}% 0, ${obj.pos}% 100%, 0 100%)`;
        });
    }
    
    createLabel(img, position) {
        const labelText = img.dataset.label;
        if (!labelText) return;
        const label = document.createElement('div');
        label.className = 'absolute top-4 sm:top-6 bg-midnight/85 backdrop-blur-md text-white border border-white/10 px-4 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[11px] font-bold tracking-[0.2em] uppercase z-20 pointer-events-none shadow-[0_8px_30px_rgb(0,0,0,0.12)]';
        label.textContent = labelText;
        if (position === 'left') {
            label.style.left = '1rem';
        } else {
            label.style.right = '1rem';
        }
        this.appendChild(label);
    }
}

customElements.define('image-compare', ImageCompare);
