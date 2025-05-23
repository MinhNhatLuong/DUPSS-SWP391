document.addEventListener('DOMContentLoaded', function() {
    // Sample data for charts
    const viewsData = {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        datasets: [
            {
                label: 'Blog',
                data: [1200, 1900, 3000, 5000, 4000, 6000, 7000, 8000, 9000, 10000, 11000, 12345],
                borderColor: '#1976d2',
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            },
            {
                label: 'Khóa học',
                data: [800, 1200, 1800, 2500, 2000, 3000, 3500, 3000, 2800, 3200, 3400, 3421],
                borderColor: '#2e7d32',
                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            },
            {
                label: 'Khảo sát',
                data: [500, 800, 1200, 1800, 2200, 2800, 3200, 3800, 4500, 5000, 5500, 5678],
                borderColor: '#f57c00',
                backgroundColor: 'rgba(245, 124, 0, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }
        ]
    };

    const contentDistributionData = {
        labels: ['Blog', 'Khóa học', 'Khảo sát', 'Tài liệu', 'Video'],
        datasets: [{
            data: [45, 25, 20, 5, 5],
            backgroundColor: [
                '#1976d2',  // Blog - xanh dương
                '#2e7d32',  // Khóa học - xanh lá
                '#f57c00',  // Khảo sát - cam
                '#d32f2f',  // Tài liệu - đỏ
                '#7b1fa2'   // Video - tím
            ],
            borderWidth: 1
        }]
    };

    // Initialize charts
    initVisitsChart();
    initContentDistributionChart();
    initEventListeners();

    // Function to initialize visits chart
    function initVisitsChart() {
        const ctx = document.getElementById('visitsChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: viewsData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#333',
                        bodyColor: '#666',
                        borderColor: '#ddd',
                        borderWidth: 1,
                        padding: 10,
                        boxPadding: 5,
                        usePointStyle: true,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.raw.toLocaleString('vi-VN') + ' lượt xem';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                if (value >= 1000) {
                                    return (value / 1000) + 'k';
                                }
                                return value;
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                elements: {
                    point: {
                        radius: 3,
                        hoverRadius: 6
                    }
                }
            }
        });
    }

    // Function to initialize content distribution chart
    function initContentDistributionChart() {
        const ctx = document.getElementById('contentDistributionChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: contentDistributionData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#333',
                        bodyColor: '#666',
                        borderColor: '#ddd',
                        borderWidth: 1,
                        padding: 10,
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.raw + '%';
                            }
                        }
                    }
                },
                cutout: '70%',
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }

    // Function to initialize event listeners
    function initEventListeners() {
        // Time range filter
        const timeRangeSelect = document.getElementById('timeRange');
        if (timeRangeSelect) {
            timeRangeSelect.addEventListener('change', function() {
                updateDashboardData(this.value);
            });
        }

        // Profile dropdown
        const profileDropdown = document.querySelector('.profile-dropdown');
        if (profileDropdown) {
            profileDropdown.addEventListener('click', function() {
                this.classList.toggle('active');
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (profileDropdown && !profileDropdown.contains(event.target)) {
                profileDropdown.classList.remove('active');
            }
        });

        // View all activities
        const viewAllBtn = document.querySelector('.view-all');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', function(e) {
                e.preventDefault();
                alert('Chức năng xem tất cả hoạt động đang được phát triển.');
            });
        }
    }

    // Function to update dashboard data based on time range
    function updateDashboardData(timeRange) {
        // Simulating data update based on time range
        let multiplier;
        switch(timeRange) {
            case 'week':
                multiplier = 0.2;
                break;
            case 'month':
                multiplier = 0.5;
                break;
            case 'year':
                multiplier = 0.8;
                break;
            case 'all':
            default:
                multiplier = 1;
                break;
        }

        // Update stats cards with new data
        updateStatsCard('Lượt xem Blog', Math.round(12345 * multiplier), multiplier > 0.5 ? 'positive' : 'negative', Math.round(12 * multiplier) + '%');
        updateStatsCard('Lượt làm Khảo sát', Math.round(5678 * multiplier), multiplier > 0.4 ? 'positive' : 'negative', Math.round(8 * multiplier) + '%');
        updateStatsCard('Lượt tham gia Khóa học', Math.round(3421 * multiplier), multiplier > 0.6 ? 'positive' : 'negative', Math.round(3 * multiplier) + '%');
        updateStatsCard('Tổng lượt truy cập', Math.round(28974 * multiplier), multiplier > 0.7 ? 'positive' : 'negative', Math.round(15 * multiplier) + '%');

        // Notify user about data update
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = 'Dữ liệu đã được cập nhật theo ' + timeRangeSelect.options[timeRangeSelect.selectedIndex].text;
        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }

    // Function to update stats card
    function updateStatsCard(title, value, changeType, changeValue) {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            const cardTitle = card.querySelector('h3').textContent;
            if (cardTitle === title) {
                const statNumber = card.querySelector('.stat-number');
                const statChange = card.querySelector('.stat-change');
                
                // Update with animation
                animateValue(statNumber, parseInt(statNumber.textContent.replace(/,/g, '')), value, 1000);
                
                // Update change indicator
                statChange.className = 'stat-change ' + changeType;
                statChange.innerHTML = `<i class="fas fa-arrow-${changeType === 'positive' ? 'up' : 'down'}"></i> ${changeValue} so với kỳ trước`;
            }
        });
    }

    // Function to animate value change
    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = Math.floor(progress * (end - start) + start);
            element.textContent = currentValue.toLocaleString('vi-VN');
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
});