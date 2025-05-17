document.addEventListener('DOMContentLoaded', function() {
    // Xử lý form bình luận
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const commentContent = document.getElementById('comment-content').value.trim();
            if (!commentContent) {
                alert('Vui lòng nhập nội dung bình luận');
                return;
            }
            
            // Trong thực tế, bạn sẽ gửi dữ liệu này đến server
            // Ở đây chúng ta sẽ giả lập việc thêm bình luận mới
            addNewComment(commentContent);
            
            // Xóa nội dung form
            document.getElementById('comment-content').value = '';
        });
    }
    
    // Xử lý nút trả lời
    const replyButtons = document.querySelectorAll('.comment-reply-btn');
    replyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const commentItem = this.closest('.comment-item');
            const authorName = commentItem.querySelector('.comment-author').textContent.split(' ')[0];
            
            // Cuộn lên form bình luận và focus vào textarea
            const commentTextarea = document.getElementById('comment-content');
            commentTextarea.focus();
            commentTextarea.value = `@${authorName}: `;
            
            // Cuộn lên form bình luận
            document.querySelector('.comment-form').scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Xử lý nút reaction
    const reactionButtons = document.querySelectorAll('.reaction-btn');
    reactionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const countSpan = this.querySelector('span');
            let count = parseInt(countSpan.textContent);
            
            // Kiểm tra xem người dùng đã like/dislike chưa
            // Trong thực tế, bạn sẽ lưu trạng thái này vào database
            if (!this.classList.contains('active')) {
                count++;
                this.classList.add('active');
                this.style.color = '#3498db';
            } else {
                count--;
                this.classList.remove('active');
                this.style.color = '#7f8c8d';
            }
            
            countSpan.textContent = count;
        });
    });
    
    // Xử lý phân trang
    const paginationButtons = document.querySelectorAll('.pagination-btn');
    paginationButtons.forEach(button => {
        if (!button.classList.contains('next')) {
            button.addEventListener('click', function() {
                // Xóa active class từ tất cả các nút
                paginationButtons.forEach(btn => btn.classList.remove('active'));
                
                // Thêm active class cho nút được click
                this.classList.add('active');
                
                // Trong thực tế, bạn sẽ tải dữ liệu bình luận mới từ server
                // Ở đây chúng ta chỉ giả lập việc chuyển trang
                console.log('Chuyển đến trang bình luận:', this.textContent);
            });
        } else {
            button.addEventListener('click', function() {
                // Tìm nút active hiện tại
                const activeButton = document.querySelector('.pagination-btn.active');
                const nextButton = activeButton.nextElementSibling;
                
                if (nextButton && !nextButton.classList.contains('next')) {
                    activeButton.classList.remove('active');
                    nextButton.classList.add('active');
                    
                    // Trong thực tế, bạn sẽ tải dữ liệu bình luận mới từ server
                    console.log('Chuyển đến trang bình luận:', nextButton.textContent);
                }
            });
        }
    });
    
    // Hàm thêm bình luận mới
    function addNewComment(content) {
        const commentsList = document.querySelector('.comments-list');
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}, ${currentDate.getHours()}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
        
        // Tạo HTML cho bình luận mới
        const newCommentHTML = `
            <div class="comment-item">
                <div class="comment-avatar">
                    <img src="https://i.pravatar.cc/60?img=${Math.floor(Math.random() * 70)}" alt="Avatar">
                </div>
                <div class="comment-content">
                    <div class="comment-header">
                        <h4 class="comment-author">Người dùng</h4>
                        <span class="comment-date">${formattedDate}</span>
                    </div>
                    <p>${content}</p>
                    <div class="comment-actions">
                        <button class="comment-reply-btn">Trả lời</button>
                        <div class="comment-reactions">
                            <button class="reaction-btn"><i class="far fa-thumbs-up"></i> <span>0</span></button>
                            <button class="reaction-btn"><i class="far fa-thumbs-down"></i> <span>0</span></button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Thêm bình luận mới vào đầu danh sách
        commentsList.insertAdjacentHTML('afterbegin', newCommentHTML);
        
        // Cập nhật số lượng bình luận
        const commentsTitle = document.querySelector('.comments-title');
        const currentCount = parseInt(commentsTitle.textContent.match(/\d+/)[0]);
        commentsTitle.textContent = `Bình luận (${currentCount + 1})`;
        
        // Thêm event listener cho nút trả lời mới
        const newReplyButton = commentsList.querySelector('.comment-item:first-child .comment-reply-btn');
        newReplyButton.addEventListener('click', function() {
            document.querySelector('.comment-form').scrollIntoView({ behavior: 'smooth' });
            document.getElementById('comment-content').focus();
            document.getElementById('comment-content').value = '@Người dùng: ';
        });
        
        // Thêm event listener cho nút reaction mới
        const newReactionButtons = commentsList.querySelectorAll('.comment-item:first-child .reaction-btn');
        newReactionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const countSpan = this.querySelector('span');
                let count = parseInt(countSpan.textContent);
                
                if (!this.classList.contains('active')) {
                    count++;
                    this.classList.add('active');
                    this.style.color = '#3498db';
                } else {
                    count--;
                    this.classList.remove('active');
                    this.style.color = '#7f8c8d';
                }
                
                countSpan.textContent = count;
            });
        });
    }
});