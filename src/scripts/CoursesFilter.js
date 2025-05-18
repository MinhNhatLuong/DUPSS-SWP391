// JavaScript for Course Filtering

document.addEventListener('DOMContentLoaded', function() {
    // Get all filter buttons and course cards
    const filterButtons = document.querySelectorAll('.filter-btn');
    const courseCards = document.querySelectorAll('.course-card');
    
    // Add click event to each filter button
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value
            const filterValue = this.getAttribute('data-filter');
            
            // Filter course cards
            courseCards.forEach(card => {
                if (filterValue === 'all') {
                    card.style.display = 'block';
                } else {
                    if (card.getAttribute('data-category') === filterValue) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });
    
    // Pagination functionality (for future implementation)
    const pageLinks = document.querySelectorAll('.page-link');
    
    if (pageLinks.length > 0) {
        pageLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all page links
                pageLinks.forEach(pl => pl.classList.remove('active'));
                
                // Add active class to clicked page link
                if (!this.classList.contains('next')) {
                    this.classList.add('active');
                }
                
                // Future pagination logic can be added here
            });
        });
    }
});