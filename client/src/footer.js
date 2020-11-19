"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NCIFooter = NCIFooter;
exports.defaultSections = void 0;

var _react = _interopRequireDefault(require("react"));

require("./nci-footer.scss");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultSections = {};
exports.defaultSections = defaultSections;

function NCIFooter(_ref) {
  var _ref$className = _ref.className,
      className = _ref$className === void 0 ? "bg-primary-dark text-light py-4" : _ref$className,
      _ref$style = _ref.style,
      style = _ref$style === void 0 ? {} : _ref$style,
      _ref$title = _ref.title,
      title = _ref$title === void 0 ? /*#__PURE__*/_react.default.createElement("div", {
    className: "mb-4"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "h4 mb-0"
  }, "National Cancer Institute"), /*#__PURE__*/_react.default.createElement("div", {
    className: "h6"
  }, "at the National Institutes of Health")) : _ref$title,
      _ref$columns = _ref.columns,
      columns = _ref$columns === void 0 ? [{
    title: 'Contact Information',
    links: [{
      title: 'Contact Us',
      href: 'mailto:NCISpatialPowerWebAdmin@nih.gov?subject=Spatial Power'
    }]
  }, {
    title: 'More Information',
    links: [{
      title: 'About This Website',
      href: 'https://www.cancer.gov/about-website'
    }, {
      title: 'Multimedia',
      href: 'https://www.cancer.gov/multimedia'
    }, {
      title: 'Publications',
      href: 'https://www.cancer.gov/publications'
    }, {
      title: 'Site Map',
      href: 'https://www.cancer.gov/about-website/sitemap'
    }, {
      title: 'Digital Standards for NCI Websites',
      href: 'https://www.cancer.gov/digital-standards'
    }]
  }, {
    title: 'Policies',
    links: [{
      href: "https://www.cancer.gov/policies/accessibility",
      title: 'Accessibility'
    }, {
      href: "https://www.cancer.gov/policies/comments",
      title: 'Content Policy'
    }, {
      href: "https://www.cancer.gov/policies/disclaimer",
      title: 'Disclaimer'
    }, {
      href: "https://www.cancer.gov/policies/foia",
      title: 'FOIA'
    }, {
      href: "https://www.cancer.gov/policies/privacy-security",
      title: 'Privacy & Security'
    }, {
      href: "https://www.cancer.gov/policies/copyright-reuse",
      title: 'Reuse & Copyright'
    }, {
      href: "https://www.cancer.gov/syndication",
      title: 'Syndication Services'
    }, {
      href: "https://www.cancer.gov/policies/linking",
      title: 'Website Linking'
    }]
  }] : _ref$columns,
      _ref$footerLinks = _ref.footerLinks,
      footerLinks = _ref$footerLinks === void 0 ? [{
    href: "http://www.hhs.gov/",
    title: "U.S. Department of Health and Human Services"
  }, {
    href: "http://www.nih.gov/",
    title: "National Institutes of Health"
  }, {
    href: "https://www.cancer.gov/",
    title: "National Cancer Institute"
  }, {
    href: "http://usa.gov/",
    title: "USA.gov"
  }] : _ref$footerLinks,
      _ref$footerText = _ref.footerText,
      footerText = _ref$footerText === void 0 ? /*#__PURE__*/_react.default.createElement("span", null, "NIH ... Turning Discovery Into Health \xAE") : _ref$footerText;
  return /*#__PURE__*/_react.default.createElement("footer", {
    className: className,
    style: style
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "container"
  }, title, /*#__PURE__*/_react.default.createElement("div", {
    className: "row mb-4"
  }, columns.map(function (column, columnIndex) {
    return /*#__PURE__*/_react.default.createElement("div", {
      key: "footer-column-".concat(columnIndex),
      className: "col-md"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "h5 font-weight-normal"
    }, column.title.toUpperCase()), /*#__PURE__*/_react.default.createElement("ul", {
      className: "footer-links"
    }, column.links.map(function (link, linkIndex) {
      return /*#__PURE__*/_react.default.createElement("li", {
        key: "footer-column-".concat(columnIndex, "-link-").concat(linkIndex)
      }, /*#__PURE__*/_react.default.createElement("a", {
        href: link.href
      }, link.title));
    })));
  }))), /*#__PURE__*/_react.default.createElement("div", {
    className: "text-center"
  }, /*#__PURE__*/_react.default.createElement("ul", {
    className: "footer-links inline"
  }, footerLinks.map(function (link, linkIndex) {
    return /*#__PURE__*/_react.default.createElement("li", {
      key: "footer-link-".concat(linkIndex)
    }, /*#__PURE__*/_react.default.createElement("a", {
      href: link.href
    }, link.title));
  })), footerText));
}