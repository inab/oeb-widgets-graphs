import { css } from 'lit-element';

export const tooltipStyles = css`
  .popover__title {
    font-size: 14px;
    text-decoration: none;
    color: rgb(228, 68, 68);
    text-align: center;
  }

  .popover__wrapper {
    position: relative;
    display: inline-block;
  }

  .popover__content {
    opacity: 0;
    visibility: hidden;
    position: absolute;
    left: -150px;
    top: 65px;
    transform: translate(0, 10px);
    background-color: rgba(0, 0, 0, .7);
    padding: .6rem 1.5rem;
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);
    width: auto;
    min-width: 200px;
    font-size: 14px;
  }

  .popover__content:before {
    position: absolute;
    z-index: -1;
    content: "";
    right: calc(50% - 10px);
    top: -8px;
    border-style: solid;
    border-width: 0 10px 10px 10px;
    border-color: transparent transparent rgba(0, 0, 0, .7) transparent;
    transition-duration: 0.3s;
    transition-property: transform;
  }

  .popover__wrapper:hover .popover__content {
    z-index: 10;
    opacity: 1;
    visibility: visible;
    transform: translate(0, -20px);
    transition: all 0.5s cubic-bezier(0.75, -0.02, 0.2, 0.97);
  }

  .popover__message__title {
    text-align: center;
  }
  
  .popover__message__body {
    text-align: center;
    font-weight: normal;
  }
`;