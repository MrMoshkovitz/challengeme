import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import Loading from '../../../../../components/Loading';
import network from '../../../../../services/network';
import '../style.css';

function LastWeekSubmissions() {
  const { id } = useParams();
  const [lastWeekSubmissions, setLastWeekSubmissions] = useState();
  const getLastWeekSubmissions = useCallback(async () => {
    try {
      const { data: submissions } = await network.get(`/api/v1/insights/teacher/last-week-submissions/${id}`);
      setLastWeekSubmissions(submissions.reverse());
    } catch (error) {
    }
    // eslint-disable-next-line
  }, [id])

  const CustomizedLabel = useCallback(({
    x, y, stroke, value,
  }) => <text x={x} y={y} dy={-4} fill={stroke} fontSize={10} textAnchor="middle">{value}</text>, []);

  const CustomizedAxisTick = useCallback(({
    x, y, stroke, payload,
  }) => (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">{payload.value}</text>
    </g>
  ), []);

  useEffect(() => {
    getLastWeekSubmissions();
    // eslint-disable-next-line
  }, [])

  return (
    lastWeekSubmissions
      ? (
        <div className="last-week-submissions-chart">
          <h2 className="dashboard-title-chart">Last Week Submissions</h2>
          <LineChart
            width={500}
            height={300}
            data={lastWeekSubmissions}
            margin={{
              top: 20, right: 30, left: 20, bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="createdAt" height={60} tick={<CustomizedAxisTick />} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="dateSubmissions" stroke="#8884d8" label={<CustomizedLabel />} />
          </LineChart>
        </div>
      ) : <Loading />
  );
}

export default LastWeekSubmissions;
