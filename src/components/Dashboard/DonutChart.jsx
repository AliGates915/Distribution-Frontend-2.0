import React from 'react';
import Chart from 'react-apexcharts';

function DonutChart() {
  return (
    <div className='container-fluid mt-1 mb-1'>
      <h2 className="pl-4 text-left text-white">Summary</h2>
      <hr className=" border-gray-600 my-2" />
      <Chart
        className="ml-1 mt-10"
        type="donut"
        width="100%"
        height="100%"
        series={[45, 67, 87, 55, 34]}
        options={{
          labels: ["In Progress", "Completed", "Next Date", "Total", "In Registration"],
          plotOptions: {
            pie: {
              donut: {
                labels: {
                  show: false,
                },
              },
            },
          },
          dataLabels: {
            enabled: false,
          },
          chart: {
            foreColor: '#fff', // Sets the text color of labels inside the chart to white
          },
          legend: {
            labels: {
              colors: '#fff', // Sets the text color of the legend labels to white
            },
          },
        }}
      />
    </div>
  );
}

export default DonutChart;