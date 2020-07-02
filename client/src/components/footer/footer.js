import React from 'react';


export function Footer({
    style = {},

    className = "",

    title = <>
        <div className="h4 mb-0">National Cancer Institute</div>
        <div className="h6">at the National Institutes of Health</div>
    </>,

    columns = [
        {title: 'Contact Information', links: [
            {title: 'Contact Us', href: 'https://www.cancer.gov/contact'},
        ]},
        {title: 'More Information', links: [
            {title: 'About This Website', href: 'https://www.cancer.gov/about-website'},
            {title: 'Multimedia', href: 'https://www.cancer.gov/multimedia'},
            {title: 'Publications', href: 'https://www.cancer.gov/publications'},
            {title: 'Site Map', href: 'https://www.cancer.gov/about-website/sitemap'},
            {title: 'Digital Standards for NCI Websites', href: 'https://www.cancer.gov/digital-standards'},
        ]},
        {title: 'Policies', links: [
            {href: "https://www.cancer.gov/policies/accessibility", title: 'Accessibility'},
            {href: "https://www.cancer.gov/policies/comments", title: 'Content Policy'},
            {href: "https://www.cancer.gov/policies/disclaimer", title: 'Disclaimer'},
            {href: "https://www.cancer.gov/policies/foia", title: 'FOIA'},
            {href: "https://www.cancer.gov/policies/privacy-security", title: 'Privacy & Security'},
            {href: "https://www.cancer.gov/policies/copyright-reuse", title: 'Reuse & Copyright'},
            {href: "https://www.cancer.gov/syndication", title: 'Syndication Services'},
            {href: "https://www.cancer.gov/policies/linking", title: 'Website Linking'}, 
        ]},
    ],

    footerLinks = [
        {href: "http://www.hhs.gov/", title: "U.S. Department of Health and Human Services"},
        {href: "http://www.nih.gov/", title: "National Institutes of Health"},
        {href: "https://www.cancer.gov/", title: "National Cancer Institute"},
        {href: "http://usa.gov/", title: "USA.gov"},
    ],

    footerText = <span>
        NIH ... Turning Discovery Into Health ®
    </span>    
}) {

    return <footer className={className || "bg-primary text-light py-4"} style={style}>
        <div className="container">
            <div className="row mb-4">
                <div className="col">
                    {title}
                </div>
            </div>

            <div className="row mb-3">
                {columns.map((column, columnIndex) => 
                    <div key={`column-${columnIndex}`} className="col-md">
                        <div className="h5 font-weight-normal">{column.title.toUpperCase()}</div>
                        <ul className="list-style-none">
                            {column.links.map((link, linkIndex) => 
                                <li key={`link-${columnIndex}-${linkIndex}`}>
                                    <a className="text-light font-weight-bold" href={link.href}>{link.title}</a>
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>


        <div className="text-center">
            <ul className="list-style-none inline-list">
                {footerLinks.map((link, linkIndex) => 
                    <li key={`footer-link-${linkIndex}`}><a className="text-light font-weight-bold" href={link.href}>{link.title}</a></li>
                )}
            </ul>
            {footerText}
        </div>
    </footer>
}