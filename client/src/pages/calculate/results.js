import React from 'react';
import {
    Table,
    paginationText,
    paginationSizeSelector,
    paginationButton,
} from '@cbiitss/react-components';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory from 'react-bootstrap-table2-filter';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';

export function Results({ results }) {
    if (!Object.keys(results).length || !results.rx || !results.n_con)
        return null;

    let statistics = new Array(results.rx.length);
    for (let i = 0; i < statistics.length; i++) {
        statistics[i] = {
            id: i,
            rr_mean: results.rr_mean[i],
            pval_mean: results.pval_mean[i],
            rr_sd: results.rr_sd[i],
            pval_prop: results.pval_prop[i],
            rx: results.rx[i],
            ry: results.ry[i],
        };
    }

    let simulations = new Array(results.n_con.length);
    for (let i = 0; i < simulations.length; i++) {
        simulations[i] = {
            id: i,
            n_con: results.n_con[i],
            n_cas: results.n_cas[i],
            bandw: results.bandw[i],
            s_obs: results.s_obs[i],
            t_obs: results.t_obs[i],
        };
    }

    let statisticsTable = {
        keyField: 'id',
        columns: [
            { dataField: 'id', text: 'ID', sort: true },
            { dataField: 'rr_mean', text: 'Mean risk', sort: true },
            { dataField: 'pval_mean', text: 'Mean p-value', sort: true },
            { dataField: 'rr_sd', text: 'Relative risk stdev', sort: true },
            { dataField: 'pval_prop', text: 'P-value proportion significance', sort: true },
            { dataField: 'rx', text: 'X coord', sort: true },
            { dataField: 'ry', text: 'Y coord', sort: true },
        ],
        data: statistics,
        filter: filterFactory(),
        pagination: paginationFactory({
            showTotal: true,
            sizePerPageList: [10, 50, 100],
            // paginationTotalRenderer: paginationText('cell', 'cells'),
            sizePerPageRenderer: paginationSizeSelector,
            pageButtonRenderer: paginationButton
        }),
    };

    let simulationsTable = {
        keyField: 'id',
        columns: [
            { dataField: 'id', text: 'ID', sort: true },
            { dataField: 'n_con', text: 'Control locations', sort: true },
            { dataField: 'n_cas', text: 'Case locations', sort: true },
            { dataField: 'bandw', text: 'Numerator bandwidth', sort: true },
            { dataField: 's_obs', text: 'S statistic length', sort: true },
            { dataField: 't_obs', text: 'T statistic length', sort: true },
        ],
        data: simulations,
        filter: filterFactory(),
        pagination: paginationFactory({
            showTotal: true,
            sizePerPageList: [10, 50, 100],
            // paginationTotalRenderer: paginationText('simulation', 'simulations'),
            sizePerPageRenderer: paginationSizeSelector,
            pageButtonRenderer: paginationButton
        }),
    };

    return <>
        <Tabs id="results-plots">
            {results.plots.map((plot, i) =>
                <Tab eventKey={`plot-${i + 1}`} title={`Plot ${i + 1}`}>
                    <div className="text-center">
                        <img className="img-fluid" src={`results/${results.id}/${plot}`} alt={`Plot ${i + 1}`} />
                    </div>
                </Tab>
            )}
        </Tabs>

        <Tabs id="results-tables">
            <Tab eventKey="simulatedData" title="Simulated Data">
                <div className="my-4" style={{ maxHeight: '400px', overflow: 'auto' }}>
                    <pre>{JSON.stringify(results.sim, null, 2)}</pre>
                </div>
            </Tab>

            <Tab eventKey="spatialRelativeRisk" title="Spatial Relative Risk">
                <div className="my-4" style={{ maxHeight: '400px', overflow: 'auto' }}>
                    <pre>{JSON.stringify(results.out, null, 2)}</pre>
                </div>
            </Tab>

            <Tab eventKey="statistics" title="Statistics">
                <div className="my-4">
                    <Table {...statisticsTable} />
                </div>
            </Tab>

            <Tab eventKey="simulations" title="Simulations">
                <div className="my-4">
                    <Table {...simulationsTable} />
                </div>
            </Tab>
        </Tabs>
    </>

}