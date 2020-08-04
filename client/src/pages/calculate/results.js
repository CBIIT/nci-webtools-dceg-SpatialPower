import React from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { useSelector } from 'react-redux';

export function Results({ results }) {
    const params = useSelector(state => state.params);

    if (!results.plots || !results.summary) 
        return null;

    const coalesce = (value, replacement) => 
        [null, undefined, ''].includes(value) ? replacement : value;

    const summary = [
        { title: 'Control locations', mean: results.summary.mean_n_con, standardDeviation: results.summary.sd_n_con, },
        { title: 'Case locations', mean: results.summary.mean_n_cas, standardDeviation: results.summary.sd_n_cas, },
        { title: 'Numerator bandwidth', mean: results.summary.mean_bandw, standardDeviation: results.summary.sd_bandw, },
        { title: 'Global S statistic length', mean: results.summary.mean_s_obs, standardDeviation: results.summary.sd_s_obs, },
        { title: 'Global T statistic length', mean: results.summary.mean_t_obs, standardDeviation: results.summary.sd_t_obs, },
    ];

    return <>
        <Tabs id="results-plots">
            {results.plots.map((plot, i) =>
                <Tab key={`results-plot-${i}`} eventKey={`plot-${i + 1}`} title={`Plot ${i + 1}`}>
                    <div className="text-center">
                        <img className="img-fluid" src={`results/${results.id}/${plot}`} alt={`Plot ${i + 1}`} />
                    </div>
                </Tab>
            )}
        </Tabs>
        <div className="table-responsive my-3">
            <table className="table">
                <thead>
                    <tr>
                        <th>Summary Statistic</th>
                        <th>Mean</th>
                        <th>Standard Deviation</th>
                    </tr>
                </thead>
                <tbody>
                    
                    {summary.map(({title, mean, standardDeviation}, i) => 
                        <tr key={`results-summary-item-${i}`}>
                            <td>{title}</td>
                            <td>{mean}</td>
                            <td>{standardDeviation}</td>
                        </tr>)}
                </tbody>
            </table>
            <b>Number of simulations: </b>
            {params.sim_total}
        </div>
        
    </>

}