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

    const plotNames = [
        'Simulated Data (First Iteration)',
        'Local Power (Continuous Scale)',
        'Local Power (Above Threshold)'
    ]

    return <>
        <div class="d-flex flex-column">
            <div className="card shadow-sm h-100 mb-3">
                <div className="card-body">
                    <b>Summary Statistic</b>
                    <small> (Number of Simulations: {params.sim_total})</small>
                    <hr style={{borderTop:'2px solid #DEE2E6'}}></hr>
                    <table className="table" style={{ marginBottom: '0px'}}>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Mean</th>
                                <th>Standard Deviation</th>
                            </tr>
                        </thead>
                        <tbody>

                            {summary.map(({ title, mean, standardDeviation }, i) =>
                                <tr key={`results-summary-item-${i}`}>
                                    <td>{title}</td>
                                    <td>{mean}</td>
                                    <td>{standardDeviation}</td>
                                </tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="card shadow-sm h-100">
                <div className="card-body">
                    <Tabs id="results-plots">
                        {results.plots.map((plot, i) =>
                            <Tab key={`results-plot-${i}`} eventKey={plotNames[i]} title={plotNames[i]}>
                                <div className="text-center">
                                    <img className="img-fluid" src={`results/${results.id}/${plot}`} alt={`Plot ${i + 1}`} />
                                </div>
                            </Tab>
                        )}
                    </Tabs>
                </div>
            </div>
        </div>
    </>

}