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
    vertical-align: middle;
  }

  .quartile-info {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    border: 0;
    background: transparent;
    cursor: help;
  }

  .quartile-info:focus-visible {
    outline: 2px solid white;
    outline-offset: 2px;
  }

  .popover__content {
    opacity: 0;
    visibility: hidden;
    position: absolute;
    right: -8px;
    top: calc(100% + 8px);
    background-color: #303943;
    color: white;
    padding: .7rem;
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);
    width: min(240px, calc(100vw - 48px));
    border-radius: 4px;
    font-size: 14px;
  }

  .popover__content:before {
    position: absolute;
    z-index: -1;
    content: "";
    right: 12px;
    top: -8px;
    border-style: solid;
    border-width: 0 10px 10px 10px;
    border-color: transparent transparent #303943 transparent;
    transition-duration: 0.3s;
    transition-property: transform;
  }

  .popover__wrapper:hover .popover__content,
  .popover__wrapper:focus-within .popover__content {
    z-index: 10;
    opacity: 1;
    visibility: visible;
  }

  @media (max-width: 640px) {
    .popover__content {
      position: fixed;
      left: 12px;
      right: 12px;
      top: auto;
      bottom: 12px;
      width: auto;
      max-height: calc(100vh - 24px);
      overflow-y: auto;
      box-sizing: border-box;
    }

    .popover__content:before {
      display: none;
    }
  }

  .popover__message__title {
    text-align: center;
    margin: 0 0 .4rem;
  }
  
  .popover__message__body {
    text-align: center;
    font-weight: normal;
    margin: 0;
    white-space: pre-line;
  }
`;