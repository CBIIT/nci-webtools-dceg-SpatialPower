import React from 'react';



export function About() {

    return <div className="container my-4">
        <h1 className="h4">About</h1>

        <hr />

        <p>
            The Spatial Power Web Tool serves as a frontend interface for the <a className="font-weight-bold" href="https://cran.r-project.org/web/packages/sparrpowR/index.html">sparrpowR package</a>. The webtool has the same functionality as the package, but allows users to easily input their study parameters into an online form instead of interacting directly with R.
        </p>

        <p>
            The web tool displays the calculated power in tabular form as well as graphically, with the same graphics directly produced by the R package. Users are  able to download their power results and visualizations directly from the webtool for implementation in presentations, grant applications, or even publications.
        </p>

        <h2 className="h5">References</h2>
        <ol>
            <li>Dorey FJ. In Brief: Statistics in Brief: Statistical Power: What Is It and When Should It Be Used? 2011.</li>
            <li>Jones S, Carley S, Harrison M. An introduction to power and sample size estimation. Emerg Med J EMJ. 2003;20(5):453.</li>
            <li>Kelsall JE, Diggle PJ. Non‐parametric estimation of spatial variation in relative risk. Stat Med. 1995;14(21‐22):2335-2342.</li>
            <li>Kelsall JE, Diggle PJ. Kernel estimation of relative risk. Bernoulli. 1995;1(1-2):3-16.</li>
            <li>Team RC. R: A language and environment for statistical computing. 2013.</li>
            <li>Baddeley A, Rubak E, Turner R. Spatial Point Patterns: Methodology and Applications with R. CRC Press; 2015.</li>
            <li>Davies TM, Marshall JC, Hazelton ML. Tutorial on kernel estimation of continuous spatial and spatiotemporal relative risk. Stat Med. 2018;37(7):1191-1221.</li>
        </ol>
    </div>
}