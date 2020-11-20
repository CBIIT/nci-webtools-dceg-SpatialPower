import React from 'react';
import { HashLink } from 'react-router-hash-link';


export function About() {

    return <div className="container my-4">
        <h1 className="h4">About</h1>

        <hr />
        
        <p>
            Spatial Power is designed to be an intuitive and simple tool for conducting power analyses of spatial statistics. This help documentation page gives a detailed description of the metrics calculated by Spatial Power modules and aids users in understanding all aspects of the required input and returned output. The documentation is divided into the following sections:
        </p>

        <ul style={{ listStyle: 'none' }}>
            <li><HashLink className='h6' smooth to='/about/#SpatialData'>Spatial Data</HashLink></li>
            <li><HashLink className='h6' smooth to='/about/#PowerAnalyses'>Power Analyses</HashLink></li>
            <HashLink className='h6' smooth to='/about/#Modules'>Modules</HashLink>
            <li>
                <ol>
                    <HashLink className='h6' smooth to='/about/#sparrpowR'>sparrpowR</HashLink>
                </ol>
            </li>   
        </ul>

        <h2 id='SpatialData' className='h5'>Spatial Data</h2>
        <p>
            Information that is referenced within a geometric space is called “spatial data.” The patterns of these data in their geometric space are of interest to many scientific fields.
            A common research question includes the identification of areas where one type of data is located relative to other types of data. Data closer to one another may be more alike than data further apart in geometric space and this can influence the nature of data collection and data analysis.
            See <HashLink className="font-weight-bold" smooth to="/about/#References">Waller and Gotway (2004)</HashLink> for more information.
        </p>

        <h2 id='PowerAnalyses' className='h5'>Power Analyses</h2>
        <p>
            Power analyses are used to answer the question, are you able to detect differences between study groups given your sample? In practice, power is used to determine if a proposed study is worth conducting.
            Well-designed studies are of paramount importance as studies conducted with low power may be subject to false inference. Spatial Power utilizes simulation-based calculations in order to define areas with significant power based on specified study design inputs.
            See <HashLink className="font-weight-bold" smooth to="/about/#References">Arnold (2011), Dorey (2011), and Jones et al. (2003)</HashLink> for more information.
        </p>


        <h2 id='Modules' className='h5'>Modules</h2>
        <p>
            Currently, Spatial Power consists of one module: <a className="font-weight-bold" href="\#sparrpowR">sparrpowR</a>.
            Each module can be accessed by clicking on the desired tab at the top of all Spatial Power pages. Below is a description of each spatial statistic, the required user-specified inputs, and an explanation of its returned output:
        </p>

        <ul>
            <p><b className='underline' id='sparrpowR'>sparrpowR</b>: Calculate statistical power for the spatial relative risk (SRR) function, which is a spatial cluster detection technique that compares two groups of point-level data.
            Users are able to specify the expected study design parameters, iteratively calculate the SRR function, and visualize the power analysis output.
            The function smooths the relative risk over a 128 x 128 (spatial units depending on the chosen study window) gridded surface with a ‘uniform’ edge correction.
            For advanced features, see the <a className="font-weight-bold" href="https://cran.r-project.org/web/packages/sparrpowR/index.html">sparrpowR</a> package available on the Comprehensive R Archive Network. </p>
            <ul>
                <p>
                    <t className='underline'>Statistic</t>:
                    <div>The spatial relative risk (SRR) function compares two groups of point-level data and detects where the spatial density of a group is statistically different from the other.
                    The risk ratio of the two spatial densities is calculated and compared against a null expectation of homogeneous risk (assuming asymptotic normality of risk).
                    See <HashLink className="font-weight-bold" smooth to="/about/#References">Kelsall & Diggle (1995a), Kelsall & Diggle (1995b), and Davies et al. (2018)</HashLink> for more background. </div>
                </p>
                <p>
                    <t className='underline'>Inputs</t>:
                    <p>Spatial Window: Window in which to simulate the random data. Choices are Unit Circle, Unit Square, Rectangle, and Circle. For both Unit Circle and Unit Square, the origin is set at (0,0) with a radius/width of 1. The Rectangle and Circle options allow for user defined origins and radii/widths.</p>
                    <p>GIS Option: Allows for a Geographic Information System overlay of statistical power results. This option is available for both rectangular and circular Spatial Windows.</p>

                    <t>Sample Case:</t>
                    <ul style={{ listStyle: 'none' }}>
                        <li>- Case Type: Specify how case locations are randomized. Choices are Uniform (evenly flat density), Multivariate Normal (circularly-shaped density with highest intensity at center), and Complete Spatial Randomness (randomly flat density).</li>
                        <li>- X coordinate(s) of case cluster(s): Numeric value, or numeric vector, of x-coordinate(s) of case cluster(s). Multiple clusters can be entered as comma separated values. </li>
                        <li>- Y coordinate(s) of case cluster(s): Numeric value, or numeric vector, of y-coordinate(s) of case cluster(s). Multiple clusters can be entered as comma separated values.</li>
                        <li>- Radius (radii) of case cluster(s): Numeric value, or numeric vector, of the radius (radii) of case cluster(s). Available for Uniform and Complete Spatial Randomness Case Types. Multiple clusters can be entered as comma separated values. </li>
                        <li>- Standard deviation(s) of case cluster(s): Numeric value, or numeric vector, of the standard deviation(s) of case cluster(s). Available for Multivariate Normal Case Type. Multiple clusters can be entered as comma separated values. </li>
                        <li>- N Case: Numeric value, or numeric vector, of the sample size for case locations in each cluster. Multiple clusters can be entered as comma separated values. </li>
                    </ul>
                </p>
                <p>
                    <t>Sample Control:</t>
                    <ul style={{ listStyle: 'none' }}>
                        <li>- Control Type: Specify how control locations are randomized. Choices are Uniform (evenly flat density), Systematic (evenly spaced), Multivariate Normal (circularly-shaped density with highest intensity at center), and Complete Spatial Randomness (randomly flat density).</li>
                        <li>- X coordinate(s) of control cluster(s): Numeric value, or numeric vector, of x-coordinate(s) of control cluster(s). Multiple clusters can be entered as comma separated values.</li>
                        <li>- Y coordinate(s) of control cluster(s): Numeric value, or numeric vector, of y-coordinate(s) of control cluster(s). Multiple clusters can be entered as comma separated values.</li>
                        <li>- Standard deviation(s) of control cluster(s): Numeric value, or numeric vector, for the standard deviation(s) of control cluster(s). Available for Multivariate Normal Control Type. Multiple clusters can be entered as comma separated values.</li>
                        <li>- N Control: Numeric value, or numeric vector, of the sample size for control locations in each cluster. Multiple clusters can be entered as comma separated values. </li>
                    </ul>
                </p>

                <p>Number of Simulations: The number of simulation iterations to perform. Utilize 1 simulation to ensure data parameters are entered correctly.</p>
                <p>Random Seed: Utilize to ensure reproducible results.</p>
                <p>Alpha: The p-value threshold for significance.</p>

                <p>
                    <t className='underline'>Outputs</t>:
                    <div>Summary Statistics:</div>
                    <ul style={{ listStyle: 'none' }}>
                        <li>- Control Locations: The number of simulated control points used within each simulation.</li>
                        <li>- Case Locations: The number of simulated case points used within each simulation.</li>
                        <li>- Bandwidth: Smoothing parameter used in the kernel. Chosen using the maximum smoothing principle (fixed for both numerator and denominator). See <HashLink className="font-weight-bold" smooth to="/about/#References">Terrell (1990)</HashLink> for more details.</li>
                        <li>- Global S statistic: The global maximum relative risk, averaged across all iterations. See <HashLink className="font-weight-bold" smooth to="/about/#References">Hazelton and Davies (2009)</HashLink> for more details</li>
                        <li>- Global T statistic: The integral of the relative risk, averaged across all iterations. See <HashLink className="font-weight-bold" smooth to="/about/#References">Hazelton and Davies (2009)</HashLink> for more details.</li>
                    </ul>
                </p>

                <p>Customize Plot Setting: Parameters include plotting titles, X-Y axes, legend location, points, symbols, colors, and sizes. The ‘Power Threshold’ is a numeric value between 0 and 1 that specifies the desired level of power. Both significantly powered case and control clusters can be displayed using the ‘Control Clusters’ option. </p>
                <p>
                    <div>Plots:</div>
                    <ul style={{ listStyle: 'none' }}>
                        <li>- Plot 1: The first iteration of simulated data given the study parameters.</li>
                        <li>- Plot 2: The continuous output of the power calculation, the proportion of iterations an area is significant.</li>
                        <li>- Plot 3: A categorical output of the power calculation based on the chosen ‘Power Threshold.’</li>
                        <li>- Plot 4 (optional): Overlay of Plot 3 output on an Open Streets Map baselayer.</li>
                    </ul>
                </p>
            </ul>
        </ul>

        <h2 id='References' className="h5">References</h2>
        <ol>
            <li>Arnold BF, Hogan DR, Colford JM, and Hubbard AE. (2011). <a className='font-weight-bold' href='https://doi.org/10.1186/1471-2288-11-94' target='_blank'>Simulation methods to estimate design power: an overview for applied research.</a> BMC Medical Research Methodology, 11(1): 94.</li>
            <li>Baddeley A, Rubak E, and Turner R. (2015). <a className='font-weight-bold' href='https://doi.org/10.1201/b19708' target='_blank'>Spatial Point Patterns: Methodology and Applications with R.</a> Boca Raton, FL: CRC Press</li>
            <li>Davies TM, Marshall JC, and Hazelton ML. (2018). <a className='font-weight-bold' href='https://doi.org/10.1002/sim.7577' target='_blank'> Tutorial on kernel estimation of continuous spatial and spatiotemporal relative risk.</a> Statistics in Medicine, 37(7): 1191-1221.</li>
            <li>Dorey FJ. (2011). <a className='font-weight-bold' href='https://doi.org/10.1007/s11999-010-1435-0' target='_blank'>In Brief: Statistics in Brief: Statistical Power: What Is It and When Should It Be Used?</a> Clinical Orthopaedics and Related Research, 469(2): 619-620.</li>
            <li>Hazelton ML and Davies TM. (2009). <a className='font-weight-bold' href='https://doi.org/10.1002/bimj.200810495' target='_blank'>Inference Based on Kernel Estimates of the Relative Risk Function in Geographical Epidemiology.</a> Biometrical Journal, 51(1): 98-109.</li>
            <li>Jones S, Carley S, Harrison M. (2003). <a className='font-weight-bold' href='http://dx.doi.org/10.1136/emj.20.5.453' target='_blank'>An introduction to power and sample size estimation.</a> Emergency Medicine Journal, 20(5): 453</li>
            <li>Kelsall JE and Diggle PJ. (1995a). <a className='font-weight-bold' href='https://doi.org/10.2307/3318678' target='_blank'>Kernel estimation of relative risk.</a> Bernoulli, 1(1-2): 3-16.</li>
            <li>Kelsall JE and Diggle PJ. (1995b). <a className='font-weight-bold' href='https://doi.org/10.1002/sim.4780142106' target='_blank'>Non‐parametric estimation of spatial variation in relative risk.</a> Statistics in Medicine, 14(21‐22): 2335-2342.</li>
            <li>Terrell, GR. (1990). <a className='font-weight-bold' href='https://doi.org/10.1080/01621459.1990.10476223' target='_blank'> The maximal smoothing principle in density estimation.</a> Journal of the American Statistical Association, 85: 470-477.</li>
            <li>Waller LA and Gotway CA. (2004). <a className='font-weight-bold' href='https://doi.org/10.1002/0471662682' target='_blank'>Applied Spatial Statistics for Public Health Data.</a> Hoboken, NJ: John Wiley & Sons, Inc</li>
        </ol>
    </div>
}