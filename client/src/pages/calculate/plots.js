import React from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { useSelector } from 'react-redux';

export function Plots() {
    const results = useSelector(state => state.results);

    if (!results.plots) {
        return null;
    }

    const plotNames = [
        'Simulated Data (First Iteration)',
        'Local Power (Continuous Scale)',
        'Local Power (Above Threshold)'
    ]

    return <>
        <div className="card shadow-sm h-100 mb-3">
            <div className="card-body">
                <Tabs id="results-plots">
                    {console.log(Array.isArray(results.plots))}
                    {Array.isArray(results.plots) && results.plots.map((plot, i) =>
    
                        <Tab key={`results-plot-${i}`} eventKey={plotNames[i]} title={plotNames[i]}>
                            <div className="text-center">
                                <img className="img-fluid" src={`results/${results.id}/${plot}?key=${results.urlKey}`} alt={`Plot ${i + 1}`} />
                            </div>
                        </Tab>
                    )}
                    {!Array.isArray(results.plots) &&
                        <Tab key={`results-plot-${1}`} eventKey={plotNames[0]} title={plotNames[0]}>
                            <div className="text-center">
                                <img className="img-fluid" src={`results/${results.id}/${results.plots}?key=${results.urlKey}`} alt={`Plot ${1}`} />
                            </div>
                        </Tab>
                    }
                </Tabs>
            </div>
        </div>
    </>

}