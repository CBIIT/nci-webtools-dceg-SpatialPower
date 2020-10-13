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
        <Card.Header>
            <h2 className="h6 d-inline-block mr-1 my-1">Summary Statistics</h2>
            <small>(Number of Simulations: {params.final_sims.toLocaleString()})</small>
        </Card.Header>

        <Card.Body>
            <div className="row">
                <div className="col-lg px-3 py-1 table-responsive">
                    <table className="table table-borderless table-sm border-lg-right">
                        <thead>
                            <tr>
                                <th><span className="sr-only">Title</span></th>
                                <th>Mean</th>
                                <th>Standard Deviation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.slice(0, 3).map(({ title, mean, standardDeviation }, i) =>
                                <tr key={`results-summary-item-${i}`}>
                                    <td>{title}</td>
                                    <td>{mean.toFixed(3)/1}</td>
                                    <td>{standardDeviation.toFixed(3)/1}</td>
                                </tr>)}
                        </tbody>
                    </table>
                    <hr className="d-block d-lg-none" />
                </div>

                <div className="col-lg px-3 py-1 table-responsive">
                    <table className="table table-borderless table-sm">
                        <thead>
                            <tr>
                                <th><span className="sr-only">Title</span></th>
                                <th>Test Statistic</th>
                                <th>P-Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.slice(3, 5).map(({ title, testStat, pValue }, i) =>
                                <tr key={`results-summary-item-${i + 3}`}>
                                    <td>{title}</td>
                                    <td>{testStat.toFixed(3)/1}</td>
                                    <td>{pValue.toFixed(3)/1}</td>
                                </tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
        </Card.Body>
    </Card>
}