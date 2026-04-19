// Fotoro - Photo Gallery Application
const API = '';
let currentPage = 1;
let totalPages = 1;
let isLoading = false;
let photos = [];
let currentLightboxIndex = 0;

// Sample photos for demonstration
const samplePhotos = [
    { id: 1, url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop', title: 'Mountain Sunrise' },
    { id: 2, url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=800&fit=crop', title: 'Nature Landscape' },
    { id: 3, url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&h=800&fit=crop', title: 'Forest Path' },
    { id: 4, url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=800&fit=crop', title: 'Morning Mist' },
    { id: 5, url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=800&fit=crop', title: 'Ocean Waves' },
    { id: 6, url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=800&fit=crop', title: 'Night Sky' },
    { id: 7, url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=800&fit=crop', title: 'Swiss Alps' },
    { id: 8, url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=800&fit=crop', title: 'Lake View' },
    { id: 9, url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&h=800&fit=crop', title: 'Alpine Lake' },
    { id: 10, url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop', title: 'Yosemite' },
    { id: 11, url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=800&fit=crop', title: 'Waterfall' },
    { id: 12, url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop', title: 'Mountain Peak' }
];

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Load photos
    loadPhotos();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup navigation
    setupNavigation();
    
    // Setup chips
    setupChips();
    
    // Setup view options
    setupViewOptions();
}

function setupEventListeners() {
    // File input change
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => handleFileUpload(e.target.files));
    }
    
    // Drag and drop for upload modal
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            handleFileUpload(e.dataTransfer.files);
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
            closeUploadModal();
        }
        
        if (document.getElementById('lightbox').classList.contains('active')) {
            if (e.key === 'ArrowLeft') navigateLightbox(-1);
            if (e.key === 'ArrowRight') navigateLightbox(1);
        }
    });
    
    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            searchPhotos(e.target.value);
        }, 300));
    }
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            const section = item.dataset.section;
            showToast(`Switched to ${section}`, 'info');
        });
    });
}

function setupChips() {
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
        });
    });
}

function setupViewOptions() {
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const view = btn.dataset.view;
            const photoGrid = document.getElementById('photoGrid');
            
            if (view === 'list') {
                photoGrid.style.gridTemplateColumns = '1fr';
                photoGrid.style.maxWidth = '800px';
            } else {
                photoGrid.style.gridTemplateColumns = '';
                photoGrid.style.maxWidth = '';
            }
        });
    });
}

// Load photos
async function loadPhotos(reset = true) {
    if (isLoading) return;
    isLoading = true;
    
    const photoGrid = document.getElementById('photoGrid');
    
    if (reset) {
        currentPage = 1;
        photoGrid.innerHTML = '';
        photos = samplePhotos;
    }
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Render photos
        photos.forEach((photo, index) => {
            photoGrid.appendChild(createPhotoElement(photo, index));
        });
        
        showToast(`Loaded ${photos.length} photos`, 'success');
    } catch (error) {
        console.error('Failed to load photos:', error);
        showToast('Failed to load photos', 'error');
    } finally {
        isLoading = false;
    }
}

function createPhotoElement(photo, index) {
    const div = document.createElement('div');
    div.className = 'photo-item';
    div.dataset.index = index;
    
    div.innerHTML = `
        <img src="${photo.url}" alt="${photo.title}" loading="lazy">
        <div class="photo-overlay"></div>
        <div class="photo-actions">
            <button class="photo-action-btn" onclick="event.stopPropagation(); toggleFavorite(${index})" title="Favorite">
                <i class="far fa-heart"></i>
            </button>
            <button class="photo-action-btn" onclick="event.stopPropagation(); sharePhoto(${index})" title="Share">
                <i class="fas fa-share-alt"></i>
            </button>
            <button class="photo-action-btn" onclick="event.stopPropagation(); deletePhoto(${index})" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    div.addEventListener('click', () => openLightbox(index));
    
    return div;
}

// Upload functionality
function triggerUpload() {
    const modal = document.getElementById('uploadModal');
    modal.classList.add('active');
}

function closeUploadModal() {
    const modal = document.getElementById('uploadModal');
    modal.classList.remove('active');
}

async function handleFileUpload(files) {
    if (!files || files.length === 0) return;
    
    closeUploadModal();
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) {
            showToast(`${file.name} is not an image`, 'error');
            continue;
        }
        
        try {
            // Simulate upload
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const newPhoto = {
                id: Date.now() + i,
                url: URL.createObjectURL(file),
                title: file.name
            };
            
            photos.unshift(newPhoto);
            
            // Add to grid
            const photoGrid = document.getElementById('photoGrid');
            const photoElement = createPhotoElement(newPhoto, 0);
            photoGrid.insertBefore(photoElement, photoGrid.firstChild);
            
            showToast(`Uploaded ${file.name}`, 'success');
        } catch (error) {
            console.error('Upload failed:', error);
            showToast(`Failed to upload ${file.name}`, 'error');
        }
    }
    
    // Reset file input
    document.getElementById('fileInput').value = '';
}

// Lightbox functionality
function openLightbox(index) {
    currentLightboxIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    
    const photo = photos[index];
    if (photo) {
        lightboxImg.src = photo.url;
        lightboxImg.alt = photo.title;
    }
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function navigateLightbox(direction) {
    const newIndex = currentLightboxIndex + direction;
    
    if (newIndex >= 0 && newIndex < photos.length) {
        currentLightboxIndex = newIndex;
        const lightboxImg = document.getElementById('lightboxImg');
        const photo = photos[newIndex];
        
        // Fade effect
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
            lightboxImg.src = photo.url;
            lightboxImg.alt = photo.title;
            lightboxImg.style.opacity = '1';
        }, 200);
    }
}

// Photo actions
function toggleFavorite(index) {
    showToast('Added to favorites', 'success');
}

function sharePhoto(index) {
    const photo = photos[index];
    
    if (navigator.share) {
        navigator.share({
            title: photo.title,
            url: photo.url
        });
    } else {
        // Copy to clipboard
        navigator.clipboard.writeText(photo.url).then(() => {
            showToast('Link copied to clipboard', 'success');
        });
    }
}

function deletePhoto(index) {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    
    photos.splice(index, 1);
    
    // Re-render grid
    const photoGrid = document.getElementById('photoGrid');
    photoGrid.innerHTML = '';
    photos.forEach((photo, i) => {
        photoGrid.appendChild(createPhotoElement(photo, i));
    });
    
    showToast('Photo deleted', 'success');
}

// Search functionality
function searchPhotos(query) {
    if (!query.trim()) {
        // Show all photos
        const photoGrid = document.getElementById('photoGrid');
        photoGrid.innerHTML = '';
        photos.forEach((photo, index) => {
            photoGrid.appendChild(createPhotoElement(photo, index));
        });
        return;
    }
    
    const filtered = photos.filter(photo => 
        photo.title.toLowerCase().includes(query.toLowerCase())
    );
    
    const photoGrid = document.getElementById('photoGrid');
    photoGrid.innerHTML = '';
    
    if (filtered.length === 0) {
        photoGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-muted);">
                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                <p>No photos found matching "${query}"</p>
            </div>
        `;
    } else {
        filtered.forEach((photo) => {
            const originalIndex = photos.findIndex(p => p.id === photo.id);
            photoGrid.appendChild(createPhotoElement(photo, originalIndex));
        });
    }
}

// Toast notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${iconMap[type]}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Close modal on outside click
window.addEventListener('click', (e) => {
    const modal = document.getElementById('uploadModal');
    if (e.target === modal) {
        closeUploadModal();
    }
});
