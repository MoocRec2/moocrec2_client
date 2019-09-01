// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

// Mooc Video Style Pie Chart
var ctx2 = document.getElementById("moocPieChart");
var moocPieChart = new Chart(ctx2, {
    type: 'doughnut',
    data: {
        labels: ["Coding", "Animation", "Talking Head", "Writing", "Slide"],
        datasets: [{
            data: [10, 25, 45, 15, 5],
            backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc','#82d973','#d49c6e'],
            hoverBackgroundColor: ['#2e59d9', '#17a673', '#215d66','#5c9153','#b57745'],
            hoverBorderColor: "rgba(234, 236, 244, 1,56,48)",
        }],
    },
    options: {
        maintainAspectRatio: false,
        tooltips: {
            backgroundColor: "rgb(255,255,255)",
            bodyFontColor: "#858796",
            borderColor: '#dddfeb',
            borderWidth: 1,
            xPadding: 15,
            yPadding: 15,
            displayColors: false,
            caretPadding: 10,
        },
        legend: {
            display: false
        },
        cutoutPercentage: 80,
    },
});
