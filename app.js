// Global state manager
const modalState = {
    isExpanded: false,
    isOpen: false
};
const scaleFactor = 1 / 20

function moveBackground(event) {
    const shapes = document.querySelectorAll(".shape");
    const x = event.clientX * scaleFactor;
    const y = event.clientY * scaleFactor;

    for (let i = 0; i < shapes.length; i++) {
        const isOdd = i % 2 === 0;
        const boolInt = isOdd ? -1 : 1;
        shapes[i].style.transform = `translate(${x * boolInt}px, ${y * boolInt}px)`
    }
}

const buttons = document.querySelectorAll(".carousel__btn")

buttons.forEach(button => {
    
    button.addEventListener("click", () => {
        const offset = button.classList.contains("next") ? 1 : -1
        const images = button
            .closest(".carousel")
            .querySelector(".carousel__images")

        const activeImage = images.querySelector(".active")
        console.log(button.classList)
        let newIndex = [...images.children].indexOf(activeImage) + offset
        if (newIndex < 0) {newIndex = images.children.length - 1}
        if (newIndex >= images.children.length) {newIndex = 0}

        images.children[newIndex].classList.add("active")
        activeImage.classList.remove("active")
    })
})

function updateModalState(updates) {
    Object.entries(updates).forEach(([selector, { add, remove }]) => {
        const element = document.querySelector(selector);
        if (element) {
            if (add) element.classList.add(add);
            if (remove) element.classList.remove(remove);
        }
    });
}

function expand() {
    if (modalState.isExpanded) return;
    
    modalState.isExpanded = true;
    
    // First, remove hidden-complete to allow transitions
    const contact = document.querySelector(".modal__contact");
    const toolkit = document.querySelector(".toolkit__list");
    const exitContact = document.querySelector(".modal__exit--contact");
    
    if (contact) contact.classList.remove("hidden-complete");
    if (toolkit) toolkit.classList.remove("hidden-complete");
    if (exitContact) exitContact.classList.remove("hidden-complete");
    
    // Force a reflow to ensure display change is applied
    if (contact) contact.offsetHeight;
    
    // Add transition classes
    updateModalState({
        ".modal__half": { add: "modal__half--expand" },
        ".toolkit__list": { add: "modal__para--resize--hidden" },
        ".modal__contact": { add: "modal__para--resize--hidden" },
        ".modal__para--wrapper": { add: "modal__para--expand" },
        ".modal__para-expand": { add: "modal__para--resize--hidden" },
        ".modal__exit--contact": { add: "modal__para--resize--hidden" },
        ".modal__exit--about": { remove: "modal__para--resize--hidden" },
        ".modal__para-collapse": { remove: "modal__para--resize--hidden" }
    });
    
    // After transition completes, add display: none
    setTimeout(() => {
        if (contact) contact.classList.add("hidden-complete");
        if (toolkit) toolkit.classList.add("hidden-complete");
        if (exitContact) exitContact.classList.add("hidden-complete");
    }, 500);
}

function collapse() {
    if (!modalState.isExpanded) return;
    
    modalState.isExpanded = false;
    
    // First, remove hidden-complete to allow transitions
    const contact = document.querySelector(".modal__contact");
    const toolkit = document.querySelector(".toolkit__list");
    const exitAbout = document.querySelector(".modal__exit--about");
    const exitContact = document.querySelector(".modal__exit--contact");
    
    if (contact) contact.classList.remove("hidden-complete");
    if (toolkit) toolkit.classList.remove("hidden-complete");
    if (exitAbout) exitAbout.classList.remove("hidden-complete");
    if (exitContact) exitContact.classList.remove("hidden-complete");
    
    // Force a reflow
    if (contact) contact.offsetHeight;
    
    // Remove transition classes
    updateModalState({
        ".modal__half": { remove: "modal__half--expand" },
        ".toolkit__list": { remove: "modal__para--resize--hidden" },
        ".modal__contact": { remove: "modal__para--resize--hidden" },
        ".modal__para--wrapper": { remove: "modal__para--expand" },
        ".modal__para-expand": { remove: "modal__para--resize--hidden" },
        ".modal__exit--about": { add: "modal__para--resize--hidden" },
        ".modal__exit--contact": { remove: "modal__para--resize--hidden" },
        ".modal__para-collapse": { add: "modal__para--resize--hidden" }
    });
    
    // After transition completes, add display: none
    setTimeout(() => {
        if (exitAbout) exitAbout.classList.add("hidden-complete");
    }, 500);
}

function toggleClass(selector, className, shouldAdd) {
    const element = document.querySelector(selector);
    if (element) {
        element.classList.toggle(className, shouldAdd);
    }
}

function toggleModal() {
    modalState.isOpen = !modalState.isOpen;
    document.body.classList.toggle("modal--open", modalState.isOpen);
}

// Contact button handler
function contactModal() {
    // If modal is closed, open it
    if (!modalState.isOpen) {
        openContactCollapsed();
        return;
    }
    
    // If modal is open and expanded, collapse it
    if (modalState.isExpanded) {
        collapse();
        return;
    }
    
    // If modal is open and collapsed, close it
    toggleModal();
}

// About link handler - opens modal in expanded state
function openAboutExpanded() {
    // If modal is closed, expand first (while invisible), then open
    if (!modalState.isOpen) {
        // Set expanded state and apply classes immediately while modal is hidden
        modalState.isExpanded = true;
        
        const contact = document.querySelector(".modal__contact");
        const toolkit = document.querySelector(".toolkit__list");
        
        // Apply expanded classes instantly
        updateModalState({
            ".modal__half": { add: "modal__half--expand" },
            ".toolkit__list": { add: "modal__para--resize--hidden" },
            ".modal__contact": { add: "modal__para--resize--hidden" },
            ".modal__para--wrapper": { add: "modal__para--expand" },
            ".modal__para-expand": { add: "modal__para--resize--hidden" },
            ".modal__exit--contact": { add: "modal__para--resize--hidden" },
            ".modal__exit--about": { remove: "modal__para--resize--hidden" },
            ".modal__para-collapse": { remove: "modal__para--resize--hidden" }
        });
        
        // Add hidden-complete immediately
        if (contact) contact.classList.add("hidden-complete");
        if (toolkit) toolkit.classList.add("hidden-complete");
        
        // Then open the modal
        toggleModal();
    }
}

// Contact link handler - opens modal in collapsed state
function openContactCollapsed() {
    // If modal is closed, collapse first (while invisible), then open
    if (!modalState.isOpen) {
        // Collapse modal and set expanded state
        collapse()
        modalState.isExpanded = false;

        // Then open the modal
        toggleModal();
    }
}

// Email form submission handler
function submitContactForm(event) {
    event.preventDefault();
    
    const overlays = {
        loading: document.querySelector(".modal__overlay--loading"),
        success: document.querySelector(".modal__overlay--success"),
        fail: document.querySelector(".modal__overlay--fail")
    };
    
    // Show loading state
    overlays.loading.classList.add("modal__overlay--visible");
    
    // Send email via EmailJS
    emailjs.sendForm(
        "service_wr1baki",
        "template_o3amf43",
        event.target,
        "FZAxPbdlVGijglwI4"
    )
    .then(() => {
        overlays.loading.classList.remove("modal__overlay--visible");
        overlays.success.classList.add("modal__overlay--visible");
    })
    .catch(() => {
        overlays.loading.classList.remove("modal__overlay--visible");
        overlays.fail.classList.add("modal__overlay--visible");
    });
}

// Helper functions
function isModalExpanded() {
    return modalState.isExpanded;
}

function isModalOpen() {
    return modalState.isOpen;
}

// Theme toggle functionality
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    
    // Save preference to localStorage
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

// Load saved theme on page load
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

// Call loadTheme when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTheme);
} else {
    loadTheme();
}

