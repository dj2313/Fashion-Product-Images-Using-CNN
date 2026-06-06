document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/stats');
        const data = await response.json();
        
        // Populate performance table
        document.getElementById('cnnAcc').textContent = data.accuracies.cnn;
        document.getElementById('mobilenetAcc').textContent = data.accuracies.mobilenet;
        
        // Render Chart
        const ctx = document.getElementById('distributionChart').getContext('2d');
        
        const labels = Object.keys(data.distribution);
        const values = Object.values(data.distribution);
        
        // Accent color from CSS
        const accentColor = '#6366f1';
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Images',
                    data: values,
                    backgroundColor: accentColor,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1a1a1a',
                        titleColor: '#f8fafc',
                        bodyColor: '#94a3b8',
                        borderColor: '#334155',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#334155'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error("Failed to load stats", error);
    }
});
