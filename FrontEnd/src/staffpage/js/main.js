// Main JavaScript file for Drug Prevention Portal

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dropdown menu functionality
    initializeDropdownMenu();
    
    // Initialize rich text editor if it exists on the page
    if (document.querySelector('.editor-toolbar')) {
        initializeRichTextEditor();
    }
    
    // Initialize quiz functionality if it exists on the page
    if (document.querySelector('.quiz-container')) {
        initializeQuizFunctionality();
    }
    
    // Initialize modal functionality
    initializeModals();
});

// Dropdown Menu Functionality
function initializeDropdownMenu() {
    const userProfile = document.querySelector('.user-profile');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (userProfile && dropdownMenu) {
        userProfile.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            dropdownMenu.style.display = 'none';
        });
        
        dropdownMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

// Rich Text Editor Functionality
function initializeRichTextEditor() {
    const editorButtons = document.querySelectorAll('.editor-btn');
    const editorContent = document.querySelector('.editor-content');
    
    if (editorButtons.length && editorContent) {
        // Make editor content editable
        editorContent.contentEditable = true;
        editorContent.focus();
        
        // Add functionality to editor buttons
        editorButtons.forEach(button => {
            button.addEventListener('click', function() {
                const command = this.dataset.command;
                const value = this.dataset.value || null;
                
                if (command === 'insertImage') {
                    const url = prompt('Nhập URL của hình ảnh:');
                    if (url) {
                        document.execCommand(command, false, url);
                    }
                } else if (command === 'createLink') {
                    const url = prompt('Nhập URL của liên kết:');
                    if (url) {
                        document.execCommand(command, false, url);
                    }
                } else if (command === 'insertHTML' && value === 'quote') {
                    document.execCommand('insertHTML', false, '<blockquote style="border-left: 3px solid #ccc; margin-left: 20px; padding-left: 10px; color: #666;">Trích dẫn</blockquote>');
                } else {
                    document.execCommand(command, false, value);
                }
                
                editorContent.focus();
            });
        });
    }
}

// Quiz Functionality
function initializeQuizFunctionality() {
    const addQuizBtn = document.querySelector('.add-quiz-btn');
    const quizContainer = document.querySelector('.quiz-items');
    
    if (addQuizBtn && quizContainer) {
        // Add new quiz item
        addQuizBtn.addEventListener('click', function() {
            const quizId = Date.now(); // Generate unique ID for the quiz
            const quizHTML = `
                <div class="quiz-item" id="quiz-${quizId}">
                    <div class="quiz-item-header">
                        <div class="quiz-item-title">Câu hỏi mới</div>
                        <div class="quiz-item-actions">
                            <button type="button" class="action-btn delete-quiz-btn" data-quiz-id="${quizId}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="quiz-title-${quizId}">Tiêu đề câu hỏi</label>
                        <input type="text" class="form-control" id="quiz-title-${quizId}" name="quiz-title-${quizId}" placeholder="Nhập tiêu đề câu hỏi">
                    </div>
                    <div class="quiz-options">
                        <div class="quiz-option">
                            <input type="radio" name="correct-option-${quizId}" id="option-${quizId}-1" checked>
                            <div class="quiz-option-text">
                                <input type="text" class="form-control" placeholder="Nhập đáp án" name="option-${quizId}-1">
                            </div>
                        </div>
                        <div class="quiz-option">
                            <input type="radio" name="correct-option-${quizId}" id="option-${quizId}-2">
                            <div class="quiz-option-text">
                                <input type="text" class="form-control" placeholder="Nhập đáp án" name="option-${quizId}-2">
                            </div>
                        </div>
                    </div>
                    <button type="button" class="add-option-btn" data-quiz-id="${quizId}">
                        <i class="fas fa-plus"></i> Thêm đáp án
                    </button>
                </div>
            `;
            
            quizContainer.insertAdjacentHTML('beforeend', quizHTML);
            
            // Add event listener to the new delete button
            const deleteBtn = document.querySelector(`#quiz-${quizId} .delete-quiz-btn`);
            deleteBtn.addEventListener('click', function() {
                document.getElementById(`quiz-${quizId}`).remove();
            });
            
            // Add event listener to the new add option button
            const addOptionBtn = document.querySelector(`#quiz-${quizId} .add-option-btn`);
            addOptionBtn.addEventListener('click', function() {
                addQuizOption(quizId);
            });
            
            // Add event listeners to radio buttons
            const radioButtons = document.querySelectorAll(`#quiz-${quizId} input[type="radio"]`);
            radioButtons.forEach(radio => {
                radio.addEventListener('change', function() {
                    updateCorrectOption(quizId, this.id);
                });
            });
        });
        
        // Initialize existing quiz items
        document.querySelectorAll('.quiz-item').forEach(quizItem => {
            const quizId = quizItem.id.replace('quiz-', '');
            
            // Add event listener to delete button
            const deleteBtn = quizItem.querySelector('.delete-quiz-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function() {
                    document.getElementById(`quiz-${quizId}`).remove();
                });
            }
            
            // Add event listener to add option button
            const addOptionBtn = quizItem.querySelector('.add-option-btn');
            if (addOptionBtn) {
                addOptionBtn.addEventListener('click', function() {
                    addQuizOption(quizId);
                });
            }
            
            // Add event listeners to radio buttons
            const radioButtons = quizItem.querySelectorAll('input[type="radio"]');
            radioButtons.forEach(radio => {
                radio.addEventListener('change', function() {
                    updateCorrectOption(quizId, this.id);
                });
            });
        });
    }
}

// Add a new option to a quiz
function addQuizOption(quizId) {
    const quizOptions = document.querySelector(`#quiz-${quizId} .quiz-options`);
    const optionCount = quizOptions.querySelectorAll('.quiz-option').length + 1;
    
    const optionHTML = `
        <div class="quiz-option">
            <input type="radio" name="correct-option-${quizId}" id="option-${quizId}-${optionCount}">
            <div class="quiz-option-text">
                <input type="text" class="form-control" placeholder="Nhập đáp án" name="option-${quizId}-${optionCount}">
            </div>
        </div>
    `;
    
    quizOptions.insertAdjacentHTML('beforeend', optionHTML);
    
    // Add event listener to the new radio button
    const newRadio = document.querySelector(`#option-${quizId}-${optionCount}`);
    newRadio.addEventListener('change', function() {
        updateCorrectOption(quizId, this.id);
    });
}

// Update the correct option for a quiz
function updateCorrectOption(quizId, selectedOptionId) {
    const quizOptions = document.querySelectorAll(`#quiz-${quizId} .quiz-option`);
    
    quizOptions.forEach(option => {
        const radio = option.querySelector('input[type="radio"]');
        if (radio.id === selectedOptionId) {
            option.classList.add('quiz-option-correct');
        } else {
            option.classList.remove('quiz-option-correct');
        }
    });
}

// Modal Functionality
function initializeModals() {
    // Open modal buttons
    const openModalButtons = document.querySelectorAll('[data-modal]');
    
    openModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.dataset.modal;
            const modal = document.getElementById(modalId);
            
            if (modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
            }
        });
    });
    
    // Close modal buttons
    const closeModalButtons = document.querySelectorAll('.modal-close');
    
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = ''; // Restore scrolling
            }
        });
    });
    
    // Close modal when clicking outside the content
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
                document.body.style.overflow = ''; // Restore scrolling
            }
        });
    });
}

// Form Submission
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Here you would typically send the form data to the server
        // For now, we'll just show a success message
        alert('Nội dung đã được gửi thành công và đang chờ duyệt!');
        
        // Redirect to content history page
        window.location.href = './content-history.html';
    });
});