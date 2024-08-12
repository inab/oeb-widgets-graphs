import { css } from 'lit-element';

export const graphStyles = css`
    @font-face {
        font-family: 'Roboto';
        src: url('../fonts/Roboto-Medium.ttf') format('ttf'),
            url('../fonts/Roboto-Regular.ttf') format('ttf');
    }

    :root,
    [data-bs-theme=light] {
    --bs-blue: #0d6efd;
    --bs-indigo: #6610f2;
    --bs-purple: #6f42c1;
    --bs-pink: #d63384;
    --bs-red: #dc3545;
    --bs-orange: #fd7e14;
    --bs-yellow: #ffc107;
    --bs-green: #198754;
    --bs-teal: #20c997;
    --bs-cyan: #0dcaf0;
    --bs-black: #000;
    --bs-white: #fff;
    --bs-gray: #6c757d;
    --bs-gray-dark: #343a40;
    --bs-gray-100: #f8f9fa;
    --bs-gray-200: #e9ecef;
    --bs-gray-300: #dee2e6;
    --bs-gray-400: #ced4da;
    --bs-gray-500: #adb5bd;
    --bs-gray-600: #6c757d;
    --bs-gray-700: #495057;
    --bs-gray-800: #343a40;
    --bs-gray-900: #212529;
    --bs-primary: #0d6efd;
    --bs-secondary: #6c757d;
    --bs-success: #198754;
    --bs-info: #0dcaf0;
    --bs-warning: #ffc107;
    --bs-danger: #dc3545;
    --bs-light: #f8f9fa;
    --bs-dark: #212529;
    --bs-primary-rgb: 13, 110, 253;
    --bs-secondary-rgb: 108, 117, 125;
    --bs-success-rgb: 25, 135, 84;
    --bs-info-rgb: 13, 202, 240;
    --bs-warning-rgb: 255, 193, 7;
    --bs-danger-rgb: 220, 53, 69;
    --bs-light-rgb: 248, 249, 250;
    --bs-dark-rgb: 33, 37, 41;
    --bs-primary-text-emphasis: #052c65;
    --bs-secondary-text-emphasis: #2b2f32;
    --bs-success-text-emphasis: #0a3622;
    --bs-info-text-emphasis: #055160;
    --bs-warning-text-emphasis: #664d03;
    --bs-danger-text-emphasis: #58151c;
    --bs-light-text-emphasis: #495057;
    --bs-dark-text-emphasis: #495057;
    --bs-primary-bg-subtle: #cfe2ff;
    --bs-secondary-bg-subtle: #e2e3e5;
    --bs-success-bg-subtle: #d1e7dd;
    --bs-info-bg-subtle: #cff4fc;
    --bs-warning-bg-subtle: #fff3cd;
    --bs-danger-bg-subtle: #f8d7da;
    --bs-light-bg-subtle: #fcfcfd;
    --bs-dark-bg-subtle: #ced4da;
    --bs-primary-border-subtle: #9ec5fe;
    --bs-secondary-border-subtle: #c4c8cb;
    --bs-success-border-subtle: #a3cfbb;
    --bs-info-border-subtle: #9eeaf9;
    --bs-warning-border-subtle: #ffe69c;
    --bs-danger-border-subtle: #f1aeb5;
    --bs-light-border-subtle: #e9ecef;
    --bs-dark-border-subtle: #adb5bd;
    --bs-white-rgb: 255, 255, 255;
    --bs-black-rgb: 0, 0, 0;
    --bs-font-sans-serif: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    --bs-font-monospace: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    --bs-gradient: linear-gradient(180deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0));
    --bs-body-font-family: var(--bs-font-sans-serif);
    --bs-body-font-size: 1rem;
    --bs-body-font-weight: 400;
    --bs-body-line-height: 1.5;
    --bs-body-color: #212529;
    --bs-body-color-rgb: 33, 37, 41;
    --bs-body-bg: #fff;
    --bs-body-bg-rgb: 255, 255, 255;
    --bs-emphasis-color: #000;
    --bs-emphasis-color-rgb: 0, 0, 0;
    --bs-secondary-color: rgba(33, 37, 41, 0.75);
    --bs-secondary-color-rgb: 33, 37, 41;
    --bs-secondary-bg: #e9ecef;
    --bs-secondary-bg-rgb: 233, 236, 239;
    --bs-tertiary-color: rgba(33, 37, 41, 0.5);
    --bs-tertiary-color-rgb: 33, 37, 41;
    --bs-tertiary-bg: #f8f9fa;
    --bs-tertiary-bg-rgb: 248, 249, 250;
    --bs-heading-color: inherit;
    --bs-link-color: #0d6efd;
    --bs-link-color-rgb: 13, 110, 253;
    --bs-link-decoration: underline;
    --bs-link-hover-color: #0a58ca;
    --bs-link-hover-color-rgb: 10, 88, 202;
    --bs-code-color: #d63384;
    --bs-highlight-color: #212529;
    --bs-highlight-bg: #fff3cd;
    --bs-border-width: 1px;
    --bs-border-style: solid;
    --bs-border-color: #dee2e6;
    --bs-border-color-translucent: rgba(0, 0, 0, 0.175);
    --bs-border-radius: 0.375rem;
    --bs-border-radius-sm: 0.25rem;
    --bs-border-radius-lg: 0.5rem;
    --bs-border-radius-xl: 1rem;
    --bs-border-radius-xxl: 2rem;
    --bs-border-radius-2xl: var(--bs-border-radius-xxl);
    --bs-border-radius-pill: 50rem;
    --bs-box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    --bs-box-shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    --bs-box-shadow-lg: 0 1rem 3rem rgba(0, 0, 0, 0.175);
    --bs-box-shadow-inset: inset 0 1px 2px rgba(0, 0, 0, 0.075);
    --bs-focus-ring-width: 0.25rem;
    --bs-focus-ring-opacity: 0.25;
    --bs-focus-ring-color: rgba(13, 110, 253, 0.25);
    --bs-form-valid-color: #198754;
    --bs-form-valid-border-color: #198754;
    --bs-form-invalid-color: #dc3545;
    --bs-form-invalid-border-color: #dc3545;
    }

    [data-bs-theme=dark] {
    color-scheme: dark;
    --bs-body-color: #dee2e6;
    --bs-body-color-rgb: 222, 226, 230;
    --bs-body-bg: #212529;
    --bs-body-bg-rgb: 33, 37, 41;
    --bs-emphasis-color: #fff;
    --bs-emphasis-color-rgb: 255, 255, 255;
    --bs-secondary-color: rgba(222, 226, 230, 0.75);
    --bs-secondary-color-rgb: 222, 226, 230;
    --bs-secondary-bg: #343a40;
    --bs-secondary-bg-rgb: 52, 58, 64;
    --bs-tertiary-color: rgba(222, 226, 230, 0.5);
    --bs-tertiary-color-rgb: 222, 226, 230;
    --bs-tertiary-bg: #2b3035;
    --bs-tertiary-bg-rgb: 43, 48, 53;
    --bs-primary-text-emphasis: #6ea8fe;
    --bs-secondary-text-emphasis: #a7acb1;
    --bs-success-text-emphasis: #75b798;
    --bs-info-text-emphasis: #6edff6;
    --bs-warning-text-emphasis: #ffda6a;
    --bs-danger-text-emphasis: #ea868f;
    --bs-light-text-emphasis: #f8f9fa;
    --bs-dark-text-emphasis: #dee2e6;
    --bs-primary-bg-subtle: #031633;
    --bs-secondary-bg-subtle: #161719;
    --bs-success-bg-subtle: #051b11;
    --bs-info-bg-subtle: #032830;
    --bs-warning-bg-subtle: #332701;
    --bs-danger-bg-subtle: #2c0b0e;
    --bs-light-bg-subtle: #343a40;
    --bs-dark-bg-subtle: #1a1d20;
    --bs-primary-border-subtle: #084298;
    --bs-secondary-border-subtle: #41464b;
    --bs-success-border-subtle: #0f5132;
    --bs-info-border-subtle: #087990;
    --bs-warning-border-subtle: #997404;
    --bs-danger-border-subtle: #842029;
    --bs-light-border-subtle: #495057;
    --bs-dark-border-subtle: #343a40;
    --bs-heading-color: inherit;
    --bs-link-color: #6ea8fe;
    --bs-link-hover-color: #8bb9fe;
    --bs-link-color-rgb: 110, 168, 254;
    --bs-link-hover-color-rgb: 139, 185, 254;
    --bs-code-color: #e685b5;
    --bs-highlight-color: #dee2e6;
    --bs-highlight-bg: #664d03;
    --bs-border-color: #495057;
    --bs-border-color-translucent: rgba(255, 255, 255, 0.15);
    --bs-form-valid-color: #75b798;
    --bs-form-valid-border-color: #75b798;
    --bs-form-invalid-color: #ea868f;
    --bs-form-invalid-border-color: #ea868f;
    }

    .w-100 {
        width: 100%;
    }

    #graph-filters {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
        min-height: 50px;
    }

    .btn {
        --bs-btn-padding-x: 0.75rem;
        --bs-btn-padding-y: 0.375rem;
        --bs-btn-font-family: ;
        --bs-btn-font-size: 1rem;
        --bs-btn-font-weight: 400;
        --bs-btn-line-height: 1.5;
        --bs-btn-color: var(--bs-body-color);
        --bs-btn-bg: transparent;
        --bs-btn-border-width: var(--bs-border-width);
        --bs-btn-border-color: transparent;
        --bs-btn-border-radius: var(--bs-border-radius);
        --bs-btn-hover-border-color: transparent;
        --bs-btn-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 1px 1px rgba(0, 0, 0, 0.075);
        --bs-btn-disabled-opacity: 0.65;
        --bs-btn-focus-box-shadow: 0 0 0 0.25rem rgba(var(--bs-btn-focus-shadow-rgb), .5);
        display: inline-block;
        padding: var(--bs-btn-padding-y) var(--bs-btn-padding-x);
        font-family: var(--bs-btn-font-family);
        font-size: var(--bs-btn-font-size);
        font-weight: var(--bs-btn-font-weight);
        line-height: var(--bs-btn-line-height);
        color: var(--bs-btn-color);
        text-align: center;
        text-decoration: none;
        vertical-align: middle;
        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        user-select: none;
        border: var(--bs-btn-border-width) solid var(--bs-btn-border-color);
        border-radius: 0.375rem;
        background-color: var(--bs-btn-bg);
        transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .container,
    .container-fluid,
    .container-xxl,
    .container-xl,
    .container-lg,
    .container-md,
    .container-sm {
    --bs-gutter-x: 1.5rem;
    --bs-gutter-y: 0;
    width: 100%;
    padding-right: calc(var(--bs-gutter-x) * 0.5);
    padding-left: calc(var(--bs-gutter-x) * 0.5);
    margin-right: auto;
    margin-left: auto;
    }

    @media (min-width: 576px) {
    .container-sm, .container {
        max-width: 540px;
    }
    }
    @media (min-width: 768px) {
    .container-md, .container-sm, .container {
        max-width: 720px;
    }
    }
    @media (min-width: 992px) {
    .container-lg, .container-md, .container-sm, .container {
        max-width: 960px;
    }
    }
    @media (min-width: 1200px) {
    .container-xl, .container-lg, .container-md, .container-sm, .container {
        max-width: 1140px;
    }
    }
    @media (min-width: 1400px) {
    .container-xxl, .container-xl, .container-lg, .container-md, .container-sm, .container {
        max-width: 1320px;
    }
    }
    :root {
    --bs-breakpoint-xs: 0;
    --bs-breakpoint-sm: 576px;
    --bs-breakpoint-md: 768px;
    --bs-breakpoint-lg: 992px;
    --bs-breakpoint-xl: 1200px;
    --bs-breakpoint-xxl: 1400px;
    }

    .graph-row {
        display: flex;
        flex: 1 1 auto;
    }

    .graph-row > * {
        flex-shrink: 0;
        width: 100%;
        max-width: 100%;
        padding-right: calc(var(--bs-gutter-x) * 0.5);
        padding-left: calc(var(--bs-gutter-x) * 0.5);
        margin-top: var(--bs-gutter-y);
    }

    .col {
    flex: 1 0 0%;
    }

    .row-cols-auto > * {
    flex: 0 0 auto;
    width: auto;
    }

    .row-cols-1 > * {
    flex: 0 0 auto;
    width: 100%;
    }

    .row-cols-2 > * {
    flex: 0 0 auto;
    width: 50%;
    }

    .row-cols-3 > * {
    flex: 0 0 auto;
    width: 33.33333333%;
    }

    .row-cols-4 > * {
    flex: 0 0 auto;
    width: 25%;
    }

    .row-cols-5 > * {
    flex: 0 0 auto;
    width: 20%;
    }

    .row-cols-6 > * {
    flex: 0 0 auto;
    width: 16.66666667%;
    }

    .col-auto {
    flex: 0 0 auto;
    width: auto;
    }

    .col-1 {
    flex: 0 0 auto;
    width: 8.33333333%;
    }

    .col-2 {
    flex: 0 0 auto;
    width: 16.66666667%;
    }

    .col-3 {
    flex: 0 0 auto;
    width: 25%;
    }

    .col-4 {
    flex: 0 0 auto;
    width: 33.33333333%;
    }

    .col-5 {
    flex: 0 0 auto;
    width: 41.66666667%;
    }

    .col-6 {
    flex: 0 0 auto;
    width: 50%;
    }

    .col-7 {
    flex: 0 0 auto;
    width: 58.33333333%;
    }

    .col-8 {
    flex: 0 0 auto;
    width: 66.66666667%;
    }

    .col-9 {
    flex: 0 0 auto;
    width: 75%;
    }

    .col-10 {
    flex: 0 0 auto;
    width: 83.33333333%;
    }

    .col-11 {
    flex: 0 0 auto;
    width: 91.66666667%;
    }

    .col-12 {
    flex: 0 0 auto;
    width: 100%;
    }

    .offset-1 {
    margin-left: 8.33333333%;
    }

    .offset-2 {
    margin-left: 16.66666667%;
    }

    .offset-3 {
    margin-left: 25%;
    }

    .offset-4 {
    margin-left: 33.33333333%;
    }

    .offset-5 {
    margin-left: 41.66666667%;
    }

    .offset-6 {
    margin-left: 50%;
    }

    .offset-7 {
    margin-left: 58.33333333%;
    }

    .offset-8 {
    margin-left: 66.66666667%;
    }

    .offset-9 {
    margin-left: 75%;
    }

    .offset-10 {
    margin-left: 83.33333333%;
    }

    .offset-11 {
    margin-left: 91.66666667%;
    }

    @media (min-width: 576px) {
        .col-sm {
        flex: 1 0 0%;
        }
        .row-cols-sm-auto > * {
        flex: 0 0 auto;
        width: auto;
        }
        .row-cols-sm-1 > * {
        flex: 0 0 auto;
        width: 100%;
        }
        .row-cols-sm-2 > * {
        flex: 0 0 auto;
        width: 50%;
        }
        .row-cols-sm-3 > * {
        flex: 0 0 auto;
        width: 33.33333333%;
        }
        .row-cols-sm-4 > * {
        flex: 0 0 auto;
        width: 25%;
        }
        .row-cols-sm-5 > * {
        flex: 0 0 auto;
        width: 20%;
        }
        .row-cols-sm-6 > * {
        flex: 0 0 auto;
        width: 16.66666667%;
        }
        .col-sm-auto {
        flex: 0 0 auto;
        width: auto;
        }
        .col-sm-1 {
        flex: 0 0 auto;
        width: 8.33333333%;
        }
        .col-sm-2 {
        flex: 0 0 auto;
        width: 16.66666667%;
        }
        .col-sm-3 {
        flex: 0 0 auto;
        width: 25%;
        }
        .col-sm-4 {
        flex: 0 0 auto;
        width: 33.33333333%;
        }
        .col-sm-5 {
        flex: 0 0 auto;
        width: 41.66666667%;
        }
        .col-sm-6 {
        flex: 0 0 auto;
        width: 50%;
        }
        .col-sm-7 {
        flex: 0 0 auto;
        width: 58.33333333%;
        }
        .col-sm-8 {
        flex: 0 0 auto;
        width: 66.66666667%;
        }
        .col-sm-9 {
        flex: 0 0 auto;
        width: 75%;
        }
        .col-sm-10 {
        flex: 0 0 auto;
        width: 83.33333333%;
        }
        .col-sm-11 {
        flex: 0 0 auto;
        width: 91.66666667%;
        }
        .col-sm-12 {
        flex: 0 0 auto;
        width: 100%;
        }
        .offset-sm-0 {
        margin-left: 0;
        }
        .offset-sm-1 {
        margin-left: 8.33333333%;
        }
        .offset-sm-2 {
        margin-left: 16.66666667%;
        }
        .offset-sm-3 {
        margin-left: 25%;
        }
        .offset-sm-4 {
        margin-left: 33.33333333%;
        }
        .offset-sm-5 {
        margin-left: 41.66666667%;
        }
        .offset-sm-6 {
        margin-left: 50%;
        }
        .offset-sm-7 {
        margin-left: 58.33333333%;
        }
        .offset-sm-8 {
        margin-left: 66.66666667%;
        }
        .offset-sm-9 {
        margin-left: 75%;
        }
        .offset-sm-10 {
        margin-left: 83.33333333%;
        }
        .offset-sm-11 {
        margin-left: 91.66666667%;
        }
        .g-sm-0,
        .gx-sm-0 {
        --bs-gutter-x: 0;
        }
        .g-sm-0,
        .gy-sm-0 {
        --bs-gutter-y: 0;
        }
        .g-sm-1,
        .gx-sm-1 {
        --bs-gutter-x: 0.25rem;
        }
        .g-sm-1,
        .gy-sm-1 {
        --bs-gutter-y: 0.25rem;
        }
        .g-sm-2,
        .gx-sm-2 {
        --bs-gutter-x: 0.5rem;
        }
        .g-sm-2,
        .gy-sm-2 {
        --bs-gutter-y: 0.5rem;
        }
        .g-sm-3,
        .gx-sm-3 {
        --bs-gutter-x: 1rem;
        }
        .g-sm-3,
        .gy-sm-3 {
        --bs-gutter-y: 1rem;
        }
        .g-sm-4,
        .gx-sm-4 {
        --bs-gutter-x: 1.5rem;
        }
        .g-sm-4,
        .gy-sm-4 {
        --bs-gutter-y: 1.5rem;
        }
        .g-sm-5,
        .gx-sm-5 {
        --bs-gutter-x: 3rem;
        }
        .g-sm-5,
        .gy-sm-5 {
        --bs-gutter-y: 3rem;
        }
    }

    @media (min-width: 768px) {
        .col-md {
        flex: 1 0 0%;
        }
        .row-cols-md-auto > * {
        flex: 0 0 auto;
        width: auto;
        }
        .row-cols-md-1 > * {
        flex: 0 0 auto;
        width: 100%;
        }
        .row-cols-md-2 > * {
        flex: 0 0 auto;
        width: 50%;
        }
        .row-cols-md-3 > * {
        flex: 0 0 auto;
        width: 33.33333333%;
        }
        .row-cols-md-4 > * {
        flex: 0 0 auto;
        width: 25%;
        }
        .row-cols-md-5 > * {
        flex: 0 0 auto;
        width: 20%;
        }
        .row-cols-md-6 > * {
        flex: 0 0 auto;
        width: 16.66666667%;
        }
        .col-md-auto {
        flex: 0 0 auto;
        width: auto;
        }
        .col-md-1 {
        flex: 0 0 auto;
        width: 8.33333333%;
        }
        .col-md-2 {
        flex: 0 0 auto;
        width: 16.66666667%;
        }
        .col-md-3 {
        flex: 0 0 auto;
        width: 25%;
        }
        .col-md-4 {
        flex: 0 0 auto;
        width: 33.33333333%;
        }
        .col-md-5 {
        flex: 0 0 auto;
        width: 41.66666667%;
        }
        .col-md-6 {
        flex: 0 0 auto;
        width: 50%;
        }
        .col-md-7 {
        flex: 0 0 auto;
        width: 58.33333333%;
        }
        .col-md-8 {
        flex: 0 0 auto;
        width: 66.66666667%;
        }
        .col-md-9 {
        flex: 0 0 auto;
        width: 75%;
        }
        .col-md-10 {
        flex: 0 0 auto;
        width: 83.33333333%;
        }
        .col-md-11 {
        flex: 0 0 auto;
        width: 91.66666667%;
        }
        .col-md-12 {
        flex: 0 0 auto;
        width: 100%;
        }
        .offset-md-0 {
        margin-left: 0;
        }
        .offset-md-1 {
        margin-left: 8.33333333%;
        }
        .offset-md-2 {
        margin-left: 16.66666667%;
        }
        .offset-md-3 {
        margin-left: 25%;
        }
        .offset-md-4 {
        margin-left: 33.33333333%;
        }
        .offset-md-5 {
        margin-left: 41.66666667%;
        }
        .offset-md-6 {
        margin-left: 50%;
        }
        .offset-md-7 {
        margin-left: 58.33333333%;
        }
        .offset-md-8 {
        margin-left: 66.66666667%;
        }
        .offset-md-9 {
        margin-left: 75%;
        }
        .offset-md-10 {
        margin-left: 83.33333333%;
        }
        .offset-md-11 {
        margin-left: 91.66666667%;
        }
        .g-md-0,
        .gx-md-0 {
        --bs-gutter-x: 0;
        }
        .g-md-0,
        .gy-md-0 {
        --bs-gutter-y: 0;
        }
        .g-md-1,
        .gx-md-1 {
        --bs-gutter-x: 0.25rem;
        }
        .g-md-1,
        .gy-md-1 {
        --bs-gutter-y: 0.25rem;
        }
        .g-md-2,
        .gx-md-2 {
        --bs-gutter-x: 0.5rem;
        }
        .g-md-2,
        .gy-md-2 {
        --bs-gutter-y: 0.5rem;
        }
        .g-md-3,
        .gx-md-3 {
        --bs-gutter-x: 1rem;
        }
        .g-md-3,
        .gy-md-3 {
        --bs-gutter-y: 1rem;
        }
        .g-md-4,
        .gx-md-4 {
        --bs-gutter-x: 1.5rem;
        }
        .g-md-4,
        .gy-md-4 {
        --bs-gutter-y: 1.5rem;
        }
        .g-md-5,
        .gx-md-5 {
        --bs-gutter-x: 3rem;
        }
        .g-md-5,
        .gy-md-5 {
        --bs-gutter-y: 3rem;
        }
    }
    @media (min-width: 992px) {
        .col-lg {
        flex: 1 0 0%;
        }
        .row-cols-lg-auto > * {
        flex: 0 0 auto;
        width: auto;
        }
        .row-cols-lg-1 > * {
        flex: 0 0 auto;
        width: 100%;
        }
        .row-cols-lg-2 > * {
        flex: 0 0 auto;
        width: 50%;
        }
        .row-cols-lg-3 > * {
        flex: 0 0 auto;
        width: 33.33333333%;
        }
        .row-cols-lg-4 > * {
        flex: 0 0 auto;
        width: 25%;
        }
        .row-cols-lg-5 > * {
        flex: 0 0 auto;
        width: 20%;
        }
        .row-cols-lg-6 > * {
        flex: 0 0 auto;
        width: 16.66666667%;
        }
        .col-lg-auto {
        flex: 0 0 auto;
        width: auto;
        }
        .col-lg-1 {
        flex: 0 0 auto;
        width: 8.33333333%;
        }
        .col-lg-2 {
        flex: 0 0 auto;
        width: 16.66666667%;
        }
        .col-lg-3 {
        flex: 0 0 auto;
        width: 25%;
        }
        .col-lg-4 {
        flex: 0 0 auto;
        width: 33.33333333%;
        }
        .col-lg-5 {
        flex: 0 0 auto;
        width: 41.66666667%;
        }
        .col-lg-6 {
        flex: 0 0 auto;
        width: 50%;
        }
        .col-lg-7 {
        flex: 0 0 auto;
        width: 58.33333333%;
        }
        .col-lg-8 {
        flex: 0 0 auto;
        width: 66.66666667%;
        }
        .col-lg-9 {
        flex: 0 0 auto;
        width: 75%;
        }
        .col-lg-10 {
        flex: 0 0 auto;
        width: 83.33333333%;
        }
        .col-lg-11 {
        flex: 0 0 auto;
        width: 91.66666667%;
        }
        .col-lg-12 {
        flex: 0 0 auto;
        width: 100%;
        }
        .offset-lg-0 {
        margin-left: 0;
        }
        .offset-lg-1 {
        margin-left: 8.33333333%;
        }
        .offset-lg-2 {
        margin-left: 16.66666667%;
        }
        .offset-lg-3 {
        margin-left: 25%;
        }
        .offset-lg-4 {
        margin-left: 33.33333333%;
        }
        .offset-lg-5 {
        margin-left: 41.66666667%;
        }
        .offset-lg-6 {
        margin-left: 50%;
        }
        .offset-lg-7 {
        margin-left: 58.33333333%;
        }
        .offset-lg-8 {
        margin-left: 66.66666667%;
        }
        .offset-lg-9 {
        margin-left: 75%;
        }
        .offset-lg-10 {
        margin-left: 83.33333333%;
        }
        .offset-lg-11 {
        margin-left: 91.66666667%;
        }
        .g-lg-0,
        .gx-lg-0 {
        --bs-gutter-x: 0;
        }
        .g-lg-0,
        .gy-lg-0 {
        --bs-gutter-y: 0;
        }
        .g-lg-1,
        .gx-lg-1 {
        --bs-gutter-x: 0.25rem;
        }
        .g-lg-1,
        .gy-lg-1 {
        --bs-gutter-y: 0.25rem;
        }
        .g-lg-2,
        .gx-lg-2 {
        --bs-gutter-x: 0.5rem;
        }
        .g-lg-2,
        .gy-lg-2 {
        --bs-gutter-y: 0.5rem;
        }
        .g-lg-3,
        .gx-lg-3 {
        --bs-gutter-x: 1rem;
        }
        .g-lg-3,
        .gy-lg-3 {
        --bs-gutter-y: 1rem;
        }
        .g-lg-4,
        .gx-lg-4 {
        --bs-gutter-x: 1.5rem;
        }
        .g-lg-4,
        .gy-lg-4 {
        --bs-gutter-y: 1.5rem;
        }
        .g-lg-5,
        .gx-lg-5 {
        --bs-gutter-x: 3rem;
        }
        .g-lg-5,
        .gy-lg-5 {
        --bs-gutter-y: 3rem;
        }
    }

    @media (min-width: 1200px) {
        .col-xl {
        flex: 1 0 0%;
        }
        .row-cols-xl-auto > * {
        flex: 0 0 auto;
        width: auto;
        }
        .row-cols-xl-1 > * {
        flex: 0 0 auto;
        width: 100%;
        }
        .row-cols-xl-2 > * {
        flex: 0 0 auto;
        width: 50%;
        }
        .row-cols-xl-3 > * {
        flex: 0 0 auto;
        width: 33.33333333%;
        }
        .row-cols-xl-4 > * {
        flex: 0 0 auto;
        width: 25%;
        }
        .row-cols-xl-5 > * {
        flex: 0 0 auto;
        width: 20%;
        }
        .row-cols-xl-6 > * {
        flex: 0 0 auto;
        width: 16.66666667%;
        }
        .col-xl-auto {
        flex: 0 0 auto;
        width: auto;
        }
        .col-xl-1 {
        flex: 0 0 auto;
        width: 8.33333333%;
        }
        .col-xl-2 {
        flex: 0 0 auto;
        width: 16.66666667%;
        }
        .col-xl-3 {
        flex: 0 0 auto;
        width: 25%;
        }
        .col-xl-4 {
        flex: 0 0 auto;
        width: 33.33333333%;
        }
        .col-xl-5 {
        flex: 0 0 auto;
        width: 41.66666667%;
        }
        .col-xl-6 {
        flex: 0 0 auto;
        width: 50%;
        }
        .col-xl-7 {
        flex: 0 0 auto;
        width: 58.33333333%;
        }
        .col-xl-8 {
        flex: 0 0 auto;
        width: 66.66666667%;
        }
        .col-xl-9 {
        flex: 0 0 auto;
        width: 75%;
        }
        .col-xl-10 {
        flex: 0 0 auto;
        width: 83.33333333%;
        }
        .col-xl-11 {
        flex: 0 0 auto;
        width: 91.66666667%;
        }
        .col-xl-12 {
        flex: 0 0 auto;
        width: 100%;
        }
        .offset-xl-0 {
        margin-left: 0;
        }
        .offset-xl-1 {
        margin-left: 8.33333333%;
        }
        .offset-xl-2 {
        margin-left: 16.66666667%;
        }
        .offset-xl-3 {
        margin-left: 25%;
        }
        .offset-xl-4 {
        margin-left: 33.33333333%;
        }
        .offset-xl-5 {
        margin-left: 41.66666667%;
        }
        .offset-xl-6 {
        margin-left: 50%;
        }
        .offset-xl-7 {
        margin-left: 58.33333333%;
        }
        .offset-xl-8 {
        margin-left: 66.66666667%;
        }
        .offset-xl-9 {
        margin-left: 75%;
        }
        .offset-xl-10 {
        margin-left: 83.33333333%;
        }
        .offset-xl-11 {
        margin-left: 91.66666667%;
        }
        .g-xl-0,
        .gx-xl-0 {
        --bs-gutter-x: 0;
        }
        .g-xl-0,
        .gy-xl-0 {
        --bs-gutter-y: 0;
        }
        .g-xl-1,
        .gx-xl-1 {
        --bs-gutter-x: 0.25rem;
        }
        .g-xl-1,
        .gy-xl-1 {
        --bs-gutter-y: 0.25rem;
        }
        .g-xl-2,
        .gx-xl-2 {
        --bs-gutter-x: 0.5rem;
        }
        .g-xl-2,
        .gy-xl-2 {
        --bs-gutter-y: 0.5rem;
        }
        .g-xl-3,
        .gx-xl-3 {
        --bs-gutter-x: 1rem;
        }
        .g-xl-3,
        .gy-xl-3 {
        --bs-gutter-y: 1rem;
        }
        .g-xl-4,
        .gx-xl-4 {
        --bs-gutter-x: 1.5rem;
        }
        .g-xl-4,
        .gy-xl-4 {
        --bs-gutter-y: 1.5rem;
        }
        .g-xl-5,
        .gx-xl-5 {
        --bs-gutter-x: 3rem;
        }
        .g-xl-5,
        .gy-xl-5 {
        --bs-gutter-y: 3rem;
        }
    }
    @media (min-width: 1400px) {
        .col-xxl {
        flex: 1 0 0%;
        }
        .row-cols-xxl-auto > * {
        flex: 0 0 auto;
        width: auto;
        }
        .row-cols-xxl-1 > * {
        flex: 0 0 auto;
        width: 100%;
        }
        .row-cols-xxl-2 > * {
        flex: 0 0 auto;
        width: 50%;
        }
        .row-cols-xxl-3 > * {
        flex: 0 0 auto;
        width: 33.33333333%;
        }
        .row-cols-xxl-4 > * {
        flex: 0 0 auto;
        width: 25%;
        }
        .row-cols-xxl-5 > * {
        flex: 0 0 auto;
        width: 20%;
        }
        .row-cols-xxl-6 > * {
        flex: 0 0 auto;
        width: 16.66666667%;
        }
        .col-xxl-auto {
        flex: 0 0 auto;
        width: auto;
        }
        .col-xxl-1 {
        flex: 0 0 auto;
        width: 8.33333333%;
        }
        .col-xxl-2 {
        flex: 0 0 auto;
        width: 16.66666667%;
        }
        .col-xxl-3 {
        flex: 0 0 auto;
        width: 25%;
        }
        .col-xxl-4 {
        flex: 0 0 auto;
        width: 33.33333333%;
        }
        .col-xxl-5 {
        flex: 0 0 auto;
        width: 41.66666667%;
        }
        .col-xxl-6 {
        flex: 0 0 auto;
        width: 50%;
        }
        .col-xxl-7 {
        flex: 0 0 auto;
        width: 58.33333333%;
        }
        .col-xxl-8 {
        flex: 0 0 auto;
        width: 66.66666667%;
        }
        .col-xxl-9 {
        flex: 0 0 auto;
        width: 75%;
        }
        .col-xxl-10 {
        flex: 0 0 auto;
        width: 83.33333333%;
        }
        .col-xxl-11 {
        flex: 0 0 auto;
        width: 91.66666667%;
        }
        .col-xxl-12 {
        flex: 0 0 auto;
        width: 100%;
        }
        .offset-xxl-0 {
        margin-left: 0;
        }
        .offset-xxl-1 {
        margin-left: 8.33333333%;
        }
        .offset-xxl-2 {
        margin-left: 16.66666667%;
        }
        .offset-xxl-3 {
        margin-left: 25%;
        }
        .offset-xxl-4 {
        margin-left: 33.33333333%;
        }
        .offset-xxl-5 {
        margin-left: 41.66666667%;
        }
        .offset-xxl-6 {
        margin-left: 50%;
        }
        .offset-xxl-7 {
        margin-left: 58.33333333%;
        }
        .offset-xxl-8 {
        margin-left: 66.66666667%;
        }
        .offset-xxl-9 {
        margin-left: 75%;
        }
        .offset-xxl-10 {
        margin-left: 83.33333333%;
        }
        .offset-xxl-11 {
        margin-left: 91.66666667%;
        }
        .g-xxl-0,
        .gx-xxl-0 {
        --bs-gutter-x: 0;
        }
        .g-xxl-0,
        .gy-xxl-0 {
        --bs-gutter-y: 0;
        }
        .g-xxl-1,
        .gx-xxl-1 {
        --bs-gutter-x: 0.25rem;
        }
        .g-xxl-1,
        .gy-xxl-1 {
        --bs-gutter-y: 0.25rem;
        }
        .g-xxl-2,
        .gx-xxl-2 {
        --bs-gutter-x: 0.5rem;
        }
        .g-xxl-2,
        .gy-xxl-2 {
        --bs-gutter-y: 0.5rem;
        }
        .g-xxl-3,
        .gx-xxl-3 {
        --bs-gutter-x: 1rem;
        }
        .g-xxl-3,
        .gy-xxl-3 {
        --bs-gutter-y: 1rem;
        }
        .g-xxl-4,
        .gx-xxl-4 {
        --bs-gutter-x: 1.5rem;
        }
        .g-xxl-4,
        .gy-xxl-4 {
        --bs-gutter-y: 1.5rem;
        }
        .g-xxl-5,
        .gx-xxl-5 {
        --bs-gutter-x: 3rem;
        }
        .g-xxl-5,
        .gy-xxl-5 {
        --bs-gutter-y: 3rem;
        }
    }

    .btn-group,
    .btn-group-vertical {
        position: relative;
        display: inline-flex;
        vertical-align: middle;
    }

    .btn-group > .btn,
    .btn-group-vertical > .btn {
        position: relative;
        flex: 1 1 auto;
    }

    .btn-group > .btn-check:checked + .btn,
    .btn-group > .btn-check:focus + .btn,
    .btn-group > .btn:hover,
    .btn-group > .btn:focus,
    .btn-group > .btn:active,
    .btn-group > .btn.active,
    .btn-group-vertical > .btn-check:checked + .btn,
    .btn-group-vertical > .btn-check:focus + .btn,
    .btn-group-vertical > .btn:hover,
    .btn-group-vertical > .btn:focus,
    .btn-group-vertical > .btn:active,
    .btn-group-vertical > .btn.active {
        z-index: 1;
    }

    .btn-group {
        border-radius: 0.375rem;
    }
    .btn-group > :not(.btn-check:first-child) + .btn,
    .btn-group > .btn-group:not(:first-child) {
        margin-left: calc(var(--bs-border-width) * -1);
    }
    .btn-group > .btn:not(:last-child):not(.dropdown-toggle),
    .btn-group > .btn.dropdown-toggle-split:first-child,
    .btn-group > .btn-group:not(:last-child) > .btn {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }
    .btn-group > .btn:nth-child(n+3),
    .btn-group > :not(.btn-check) + .btn,
    .btn-group > .btn-group:not(:first-child) > .btn {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }

    .btn-group.btn-graphs .btn {
        background-color: #f7f7f7;
        border: 1px solid #dfe3ee;
        font-size: 12px;
        font-weight: bold;
    }

    .btn-group.btn-graphs .btn:hover {
        background-color: #ddd;
    }

    .oeb-graph {
        font-family: "Roboto", sans-serif;
        padding: 10px;
        position: relative;
    }

    .tools-col {
        padding-left: 10px;
    }

    .tools-table {
        width: 100%;
        border-collapse: collapse;
        max-height: 800px;
    }

    .tools-table thead {
        height: 40px;
    }

    .tools-table th {
        background-color: #6c757d !important;
        color: white !important;
        text-align: left !important;
        font-size: 16px !important;
        height: 38px;
        padding: 10px;
    }

    .tools-table td {
        border: 1px solid #e0e0e0;
        padding: 10px;
        font-size: 16px !important;
    }

    .tools-table .tools-th {
        width: 60%;
    }

    .tools-table .classify-th {
        width: 40%;
    }

    #chartCapture {
        justify-content: center;
    }

    .custom-table {
        width: 100%;
        min-height: 30px;
        border-collapse: separate !important;
        border-spacing: 0;

    }

    .custom-table th {
        background-color: #DDDDDD;
        font-size: 16px !important;
    }

    .custom-table td {
        border: 1px solid #e0e0e0;
        text-align: center;
        font-size: 16px !important;
    }

    .custom-table .first-th {
        border-top-left-radius: 10px;
        border-bottom-left-radius: 10px;
    }

    .custom-table .last-td {
        border-top-right-radius: 10px;
        border-bottom-right-radius: 10px;
    }

    .custom-table tr:hover {
        background-color: inherit !important;
    }

    .info-table {
        padding: 5px 25px;
    }

    .dropbtn {
        background-color: rgb(247, 247, 247);
        border: 1px solid rgb(223, 227, 238);
        font-size: 12px;
        font-weight: bold;
        height: 100%;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-top-right-radius: 0.375rem;
        border-bottom-right-radius: 0.375rem;
        padding: 0.375rem 0.75rem;
    }

    .dropbtn.btn-xl {
        min-width: 175px;
    }

    .dropbtn.btn-center {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }

    .first-btn {
        border-top-left-radius: 0.375rem;
        border-bottom-left-radius: 0.375rem;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }

    .dropbtn {
        display: flex;
        align-content: baseline;
        justify-content: center;
    }

    .dropbtn.first-btn .btn-icon-wrapper,
    .dropbtn.download-btn .btn-icon-wrapper {
        padding: 1px 5px 0px 20px;
    }

    .dropbtn.first-btn svg,
    .dropbtn.download-btn svg,
    .dropbtn svg {
        height: 12px;
        width: 12px;
    }

    .dropdown {
        position: relative;
        display: inline-block;
    }

    .download-btn {
        min-width: 175px;
        display: flex;
        align-content: baseline;
        justify-content: center;
    }

    .dropdown-content {
        display: none;
        position: absolute;
        background-color: #f1f1f1;
        min-width: 175px;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 1;
        font-size: 12px;
    }

    .dropdown-content div {
        color: black;
        padding: 12px 16px;
        text-decoration: none;
        display: block;
        cursor: pointer;
    }

    .dropdown-content div.active {
        font-weight: bold;
    }
    .dropdown-content div.disabled {
        color: #ccc;
        cursor: not-allowed;
    }

    .dropdown-content div:hover { 
        background-color: #ddd;
    }

    .classification-dropdown {
        min-width: 175px;
    }

    .classification-dropdown .dropbtn {
        width: 100%;
    }

    .dropdown:hover .dropdown-content {
        display: block;
    }

    .dropdown .btn-icon-wrapper {
        padding-left: 15px;
    }

    .dropdown .btn-icon-wrapper svg {
        transition: transform .5s ease-in-out;
    }

    .dropdown:hover .btn-icon-wrapper svg {
        transition: transform .5s ease-in-out;
        transform: rotate(-90deg) translateY(0);
    }

    .toolColumn {
        cursor: pointer;
        position: relative;
    }

    .toolColumn .color-box {
        width: 20px;
        height: 100%;
        display: inline-block;
        position: absolute;
        left: 0px;
        top: 50%;
        transform: translateY(-50%);
        background-color: rgba(255, 255, 255, 0.5);
    }

    .toolColumn span {
        display: inline-block;
        margin-left: 25px;
        transition: transform 0.3s ease;
    }

    .toolColumn:hover span {
        transform: translateX(5px);
        font-style: italic;
        color: #0A58A2;
    }

    .quartil-1 {
        background-color: rgb(237, 248, 233);
    }

    .quartil-2 {
        background-color: rgb(186, 228, 179);
    }

    .quartil-3 {
        background-color: rgb(116, 196, 118);
    }

    .quartil-4 {
        background-color: rgb(35, 139, 69);
    }

    .quartil-zero {
        background-color: rgba(237, 231, 231, 0.5);
    }

    #sortOrderBtn {
        min-width: 150px;
    }

    .download-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(35, 49, 66, .95);
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 5;
    }
`;