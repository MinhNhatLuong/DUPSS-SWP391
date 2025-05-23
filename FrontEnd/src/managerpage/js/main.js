// Main JavaScript for all pages
document.addEventListener('DOMContentLoaded', function() {
    // Toggle dropdown menu
    const profileDropdown = document.querySelector('.profile-dropdown');
    if (profileDropdown) {
        profileDropdown.addEventListener('click', function(e) {
            const dropdownMenu = this.querySelector('.dropdown-menu');
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
            e.stopPropagation();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            const dropdownMenu = profileDropdown.querySelector('.dropdown-menu');
            if (dropdownMenu.style.display === 'block') {
                dropdownMenu.style.display = 'none';
            }
        });
    }

    // File upload preview
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            const previewId = this.id === 'blogFeaturedImage' ? 'imagePreview' : 'courseImagePreview';
            const preview = document.getElementById(previewId);
            
            if (preview) {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                        preview.style.display = 'block';
                    };
                    
                    reader.readAsDataURL(this.files[0]);
                }
            }
        });
    });

    // Simple text editor toolbar functionality
    const toolbarButtons = document.querySelectorAll('.toolbar-btn');
    const textareas = document.querySelectorAll('textarea[id$="Content"]');
    
    if (toolbarButtons.length > 0 && textareas.length > 0) {
        toolbarButtons.forEach(button => {
            button.addEventListener('click', function() {
                const textarea = this.closest('.form-group').querySelector('textarea');
                const startPos = textarea.selectionStart;
                const endPos = textarea.selectionEnd;
                const selectedText = textarea.value.substring(startPos, endPos);
                
                let format = '';
                
                switch(this.querySelector('i').className) {
                    case 'fas fa-bold':
                        format = `**${selectedText}**`;
                        break;
                    case 'fas fa-italic':
                        format = `*${selectedText}*`;
                        break;
                    case 'fas fa-underline':
                        format = `<u>${selectedText}</u>`;
                        break;
                    case 'fas fa-heading':
                        format = `## ${selectedText}`;
                        break;
                    case 'fas fa-list-ul':
                        format = `\n- ${selectedText.split('\n').join('\n- ')}`;
                        break;
                    case 'fas fa-list-ol':
                        let lines = selectedText.split('\n');
                        format = '\n';
                        for (let i = 0; i < lines.length; i++) {
                            format += `${i+1}. ${lines[i]}\n`;
                        }
                        break;
                    case 'fas fa-link':
                        const url = prompt('Nhập URL:', 'http://');
                        if (url) {
                            format = `[${selectedText}](${url})`;
                        }
                        break;
                    case 'fas fa-image':
                        const imageUrl = prompt('Nhập URL hình ảnh:', 'http://');
                        if (imageUrl) {
                            format = `![${selectedText}](${imageUrl})`;
                        }
                        break;
                    case 'fas fa-quote-right':
                        format = `\n> ${selectedText.split('\n').join('\n> ')}`;
                        break;
                }
                
                if (format) {
                    textarea.focus();
                    if (selectedText) {
                        textarea.value = textarea.value.substring(0, startPos) + format + textarea.value.substring(endPos);
                    } else {
                        textarea.value = textarea.value.substring(0, startPos) + format + textarea.value.substring(startPos);
                        const cursorPos = startPos + format.length;
                        textarea.selectionStart = cursorPos;
                        textarea.selectionEnd = cursorPos;
                    }
                }
            });
        });
    }

    // Search functionality
    const searchBar = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    
    if (searchBar && searchButton) {
        searchButton.addEventListener('click', function() {
            performSearch(searchBar.value);
        });
        
        searchBar.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(searchBar.value);
            }
        });
    }
    
    function performSearch(query) {
        if (query.trim() !== '') {
            alert(`Tìm kiếm: ${query}`);
            // Implement actual search functionality here
        }
    }
});