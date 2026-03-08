import glob
import re

html_files = glob.glob("*.html")

topbar_new = """    <div class="bg-midnight text-white py-2 px-4 md:px-12 flex justify-center sm:justify-between items-center text-[10px] sm:text-xs md:text-sm font-medium overflow-hidden">
        <div class="flex items-center gap-2 sm:gap-4 md:gap-8">
            <a class="flex items-center gap-1 sm:gap-2 hover:text-accent transition-colors whitespace-nowrap" href="tel:0784792291">
                <span class="material-symbols-outlined text-[14px] sm:text-[18px]">call</span>
                <span class="tracking-tight sm:tracking-normal">07 84 79 22 91</span>
            </a>
            <a class="hidden sm:flex items-center gap-2 hover:text-accent transition-colors"
                href="mailto:ruizdiazobrassl@hotmail.com">
                <span class="material-symbols-outlined text-[18px]">mail</span>
                ruizdiazobrassl@hotmail.com
            </a>
        </div>
        <div class="hidden md:flex items-center gap-4">
            <span class="text-white/80 tracking-wide truncate">Expertise Rénovation Paris &amp; Ile-de-France</span>
        </div>
    </div>"""

header_cta_new = """            <div class="flex items-center gap-2 sm:gap-4">
                <a href="contact.html"
                    class="bg-accent hover:bg-accent-hover text-white font-black px-4 py-2 md:px-7 md:py-3 rounded-full transition-all shadow-lg hover:shadow-accent/20 text-[10px] md:text-sm uppercase tracking-widest focus:outline-none whitespace-nowrap">
                    Devis <span class="hidden md:inline">Gratuit</span>
                </a>
                <!-- Hamburger Button -->
                <button id="mobile-menu-btn" class="lg:hidden text-midnight hover:text-accent focus:outline-none p-1 sm:p-2" aria-label="Ouvrir le menu">
                    <span class="material-symbols-outlined text-3xl">menu</span>
                </button>
            </div>"""

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Apply topbar fixes
    pattern1 = r'<div class="bg-midnight text-white py-2\.5 px-6.*?Expertise Rénovation Paris &amp; Ile-de-France</span>\s*</div>\s*</div>'
    content = re.sub(pattern1, topbar_new, content, flags=re.DOTALL)
    
    # Apply CTA fixes
    pattern2 = r'<div class="flex items-center gap-4">\s*<a href="contact\.html"\s*class="hidden md:inline-block bg-accent.*?Devis Gratuit\s*</a>\s*<!-- Hamburger Button -->.*?</button>\s*</div>'
    content = re.sub(pattern2, header_cta_new, content, flags=re.DOTALL)

    # Apply cache bust for mobile-menu.js
    content = content.replace('src="assets/js/mobile-menu.js"', 'src="assets/js/mobile-menu.js?v=3"')
    content = content.replace('src="assets/js/mobile-menu.js?v=2"', 'src="assets/js/mobile-menu.js?v=3"')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("HTML files updated successfully.")
