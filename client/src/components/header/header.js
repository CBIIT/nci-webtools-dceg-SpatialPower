import React from 'react';

export function Header({
    className = 'container py-4',
    style = {},
    imageClassName = '',
    imageStyle = {maxWidth: '80%'},
    imageProps = {},
    imageSource = 'assets/images/nci-logo.svg',
    url = 'https://www.cancer.gov/'
}) {
    return <header className={className} style={style}>
        
            <a href={url} target="_blank" rel="noopener noreferrer">
                <img 
                    src={imageSource} 
                    style={imageStyle}
                    className={imageClassName}
                    height="60" 
                    alt="National Cancer Institute Logo" 
                    {...imageProps}
                />
            </a>
    </header>
}