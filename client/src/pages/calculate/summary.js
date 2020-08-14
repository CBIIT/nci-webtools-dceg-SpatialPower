import React from 'react';
import { useSelector } from 'react-redux';
import Card from 'react-bootstrap/Card';

export function Summary() {
    const params = useSelector(state => state.params);
    const results = useSelector(state => state.results);
    if (!results.summary) return null;

    const summary = [
        { title: 'Control locations', mean: results.summary.mean_n_con, standardDeviation: results.summary.sd_n_con, },
        { title: 'Case locations', mean: results.summary.mean_n_cas, standardDeviation: results.summary.sd_n_cas, },
        { title: 'Numerator bandwidth', mean: results.summary.mean_bandw, standardDeviation: results.summary.sd_bandw, },
        { title: 'Global S statistic length', testStat: results.summary.s_test_stat, pValue: results.summary.s_pval, },
        { title: 'Global T statistic length', testStat: results.summary.t_test_stat, pValue: results.summary.t_pval, },
    ];

    return <Card className="shadow-sm mb-3">
        <Card.Header className="bg-white">
            <h2 className="h6 d-inline-block mr-1 my-1">Summary Statistics</h2>
            <small>(Number of Simulations: {params.sim_total})</small>
        </Card.Header>

        <Card.Body>
            <div className="d-flex flex-row">
                <table className="table mb-0 mr-2" style={{borderRight: '2px solid #c3c4c9'}}>
                    <thead>
                        <tr>
                            <th className="w-25"><span className="sr-only">Title</span></th>
                            <th className="w-25">Mean</th>
                            <th className="w-25">Standard Deviation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {summary.slice(0, 3).map(({ title, mean, standardDeviation }, i) =>
                            <tr key={`results-summary-item-${i}`}>
                                <td>{title}</td>
                                <td>{mean}</td>
                                <td>{standardDeviation}</td>
                            </tr>)}
                    </tbody>
                </table>

                <table className="table mb-0 ml-2">
                    <thead>
                        <tr>
                            <th className="w-25"><span className="sr-only">Title</span></th>
                            <th className="w-25">Test Statistic</th>
                            <th className="w-25">P-Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {summary.slice(3, 5).map(({ title, testStat, pValue }, i) =>
                            <tr key={`results-summary-item-${i + 3}`}>
                                <td>{title}</td>
                                <td>{testStat}</td>
                                <td>{pValue}</td>
                            </tr>)}
                    </tbody>
                </table>
            </div>
        </Card.Body>
    </Card>
}