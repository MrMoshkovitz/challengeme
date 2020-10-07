import React from 'react';
import {Bar} from 'react-chartjs-2';

function ChartBar({data}) {
    const state = {
        labels: data.labels,
        datasets: [
          {
            label: data.type,
            backgroundColor: 'rgba(75,192,192,1)',
            borderColor: 'rgba(0,0,0,1)',
            borderWidth: 2,
            data: data.data
          },
          {
            label: data.type,
            backgroundColor: 'red',
            borderColor: 'rgba(0,0,0,1)',
            borderWidth: 2,
            data: data.data 
          }
        ]
      }
  return (
    <>
    <Bar
          data={state}
          options={{
            title:{
              display:true,
              text:data.title,
              fontSize:20
            },
            legend:{
              display:true,
              position:'right'
            }
          }}
        />
    </>
  );
}

export default ChartBar;