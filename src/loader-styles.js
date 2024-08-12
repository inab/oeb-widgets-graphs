import { css } from 'lit-element';

export const loaderStyles = css`
    .loader-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        width: 100vw;
        position: fixed;
        top: 0;
        left: 0;
        background-color: white;
        z-index: 999;
    }

    .loader {
        width: 24px;
        height: 80px;
        display: block;
        margin: 35px auto 0;
        border: 1px solid black;
        border-radius: 0 0 50px 50px;
        position: relative;
        box-shadow: 0px 0px #0b579f inset;
        background-image: linear-gradient(#0b579f 100px, transparent 0);
        background-position: 0px 0px;
        background-size: 22px 80px;
        background-repeat: no-repeat;
        box-sizing: border-box;
        animation: animloader 6s linear infinite;
        border-top: none;
    }

    .loader::after {
        content: '';  
        box-sizing: border-box;
        top: -6px;
        left: 50%;
        transform: translateX(-50%);
        position: absolute;
        border: 1px solid #2C2E43;
        border-radius: 50%;
        width: 28px;
        height: 6px;
    }

    .loader::before {
        content: '';  
        box-sizing: border-box;
        left: 0;
        bottom: -4px;
        border-radius: 50%;
        position: absolute;
        width: 6px;
        height: 6px;
        animation: animloader1 6s linear infinite;
    }

    @keyframes animloader {
        0% {
            background-position: 0px 80px;
        }
        100% {
            background-position: 0px 0px;
        }
    }

    @keyframes animloader1 {
        0% {
            box-shadow: 4px -10px rgba(255, 255, 255, 0), 6px 0px rgba(255, 255, 255, 0), 8px -15px rgba(255, 255, 255, 0), 12px 0px rgba(255, 255, 255, 0);
        }
        20% {
            box-shadow: 4px -20px rgba(255, 255, 255, 0), 8px -10px rgba(255, 255, 255, 0), 10px -30px rgba(244, 124, 33, 1), 15px -5px rgba(255, 255, 255, 0);
        }
        40% {
            box-shadow: 2px -40px rgba(244, 124, 33, 1), 8px -30px rgba(244, 124, 33, .6), 8px -60px rgba(244, 124, 33, 1), 12px -15px rgba(244, 124, 33, 1);
        }
        60% {
            box-shadow: 4px -60px rgba(244, 124, 33, 1), 6px -50px rgba(244, 124, 33, .6), 10px -90px rgba(244, 124, 33, 1), 15px -25px rgba(244, 124, 33, 1);
        }
        80% {
            box-shadow: 2px -80px rgba(244, 124, 33, 1), 4px -70px rgba(244, 124, 33, .6), 8px -120px rgba(255, 255, 255, 0), 12px -35px rgba(244, 124, 33, 1);
        }
        100% {
            box-shadow: 4px -100px rgba(255, 255, 255, 0), 8px -90px rgba(255, 255, 255, 0), 10px -120px rgba(255, 255, 255, 0), 15px -45px rgba(255, 255, 255, 0);
        }
    }

    .text-loader {
        color: #2C2E43;
        display: inline-block;
        position: relative;
        font-size: 25px;
        font-family: Arial, Helvetica, sans-serif;
        box-sizing: border-box;
    }

    .text-loader::after {
        content: '';  
        width: 5px;
        height: 5px;
        background: currentColor;
        position: absolute;
        bottom: 5px;
        right: -15px;
        box-sizing: border-box;
        animation: animTextloader 1s linear infinite;
    }

    @keyframes animTextloader {
        0% {
            box-shadow: 10px 0 rgba(255, 255, 255, 0), 20px 0 rgba(255, 255, 255, 0);
        }
        50% {
            box-shadow: 10px 0 #2C2E43, 20px 0 rgba(255, 255, 255, 0);
        }
        100% {
            box-shadow: 10px 0 #2C2E43, 20px 0 #2C2E43;
        }
    }


`;

