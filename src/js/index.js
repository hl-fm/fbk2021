import {
    preloadImages,
    preloadFonts,
    createImageSections,
    createFooterSection,
    createVerticalScrollBar,
    setStyleProperty,
} from './utils';
import LocomotiveScroll from 'locomotive-scroll';
import LazyLoad from 'vanilla-lazyload';
import { constants } from './store';

import '@dile/dile-social-icon/dile-social-icon.js';

import '../css/base.css';

let sectionIds;
let currentDateInView;

const createContent = new Promise((resolve, reject) => {
    createImageSections().then(res => {
        document.documentElement.style.setProperty('--verticalBarHeight', `0%`);

        sectionIds = res;
        createFooterSection();
        createVerticalScrollBar();
        resolve();
    }).catch(err => {
        console.log(err);
        reject(err);
    });
});

const resize = () => {
    constants.isDevice = 'ontouchstart' in window;
    if (constants.isDevice) document.body.classList.add('is-device');
    else document.body.classList.remove('is-device');
};
resize();
window.onresize = () => {
    resize();
}

class LoadingGooey {
    constructor(el) {
        this.SPEED = 1;
        this.dom = el;
        this.content = el.querySelector('.holder-content');
        this.list = el.querySelector('.gooey-list');
        this.items = Array.from(el.querySelectorAll('.gooey'));
        this.bubble = el.querySelector('.bubble');
        this.scrollDistance = this.SPEED;
        this.init();
    }
    start() {
        this.dom.classList.remove('hide');
        // this.dom.classList.add('show');
        this.raId = requestAnimationFrame(() => this.animate());
    }
    stop() {
        // this.dom.classList.remove('show');
        this.dom.classList.add('hide');
        cancelAnimationFrame(this.raId);
    }
    init() {
        // this.start();
    }
    animate() {
        if (this.content.scrollLeft + this.content.clientWidth >= this.list.clientWidth) {
            this.scrollDistance = -this.SPEED;
        }
        else if (this.content.scrollLeft === 0 && this.scrollDistance === -this.SPEED) this.scrollDistance = this.SPEED;
        this.content.scrollTo(this.content.scrollLeft + this.scrollDistance, 0);
        this.bubble.style.left = `${this.content.scrollLeft + 100}px`;

        this.raId = requestAnimationFrame(() => this.animate());
    }
}

const loader = new LoadingGooey(document.querySelector('.holder'));

// Preload  images and fonts
Promise.all([
    createContent,
    preloadImages('.gooey'),
    preloadImages('.circle'),
    preloadImages('.img.img1'),
    preloadImages('.content-sticky-img')
]).then(() => {
    // Remove loader (loading class)
    // document.body.classList.remove('loading');
    document.body.classList.add('load');
    loader.start();
    setTimeout(() => {
        loader.stop();
    }, 5000);

    const verticalBar = document.querySelector('.vertical-bar');
    const verticalBarLabel = document.querySelector('.vertical-bar .label');

    // init lazy load instance
    const lazyFunctions = {
        imageLoaded: (element) => {
            // element.classList.add('load');
        },
    }
    const executeLazyFunction = (element) => {
        const lazyFunctionName = element.getAttribute("data-lazy-function");
        const lazyFunction = lazyFunctions[lazyFunctionName];
        if (!lazyFunction) return;
        lazyFunction(element);
    }
    const myLazyLoad = new LazyLoad({
        unobserve_entered: true,
        callback_enter: executeLazyFunction
    });

    // Initialize the Locomotive scroll
    const scroll = new LocomotiveScroll({
        el: document.querySelector('[data-scroll-container]'),
        smooth: true
    });
    scroll.on('scroll', (args) => {
        //console.log(args);
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        const currentProgress = Math.round( (args.scroll.y + vh) / args.limit.y * 100 );
        setStyleProperty('--verticalBarHeight', `${currentProgress}%`);
        verticalBar.dataset.value = `${currentProgress}%`;

        // Get all current elements : args.currentElements
        const keys = Object.keys(args.currentElements);

        if (currentProgress >= 0 && currentProgress <= 110 && (keys.includes('grid0') || args.scroll.y > (vh * 0.6))) {
            verticalBar.classList.add('show');
        } else verticalBar.classList.remove('show');

        if (keys.length) {
            const element = args.currentElements[keys[0]];
            if (typeof element === 'object' && sectionIds.includes(element.id)) {
                const el = element.el;
                const tiles = el.querySelectorAll('.tiles__line-img');
                if (tiles && tiles[0]) {
                    const dataData = tiles[0].dataset.date.replace('/', '_');
                    if (dataData !== currentDateInView) {
                        const scrollToEl = verticalBarLabel.querySelector(`#p${dataData}`);
                        if (scrollToEl) {
                            verticalBarLabel.scrollTo({
                                top: scrollToEl.offsetTop - 4
                            })
                        }
                        currentDateInView = dataData;
                    }
                }
            }
        }

    });
    /*scroll.on('call', (value, way, obj) => {
        if (value === 'tile' && way === 'enter') {

            if (typeof obj === 'object' && sectionIds.includes(obj.id)) {
                const el = obj.el;
                const tiles = Array.from(el.querySelectorAll('.tiles__line-img'));

                if (!el.dataset.load) {
                    el.dataset.load = 'true';
                    if (tiles.length) {
                        tiles.forEach(tile => {
                            tile.setAttribute('style', tile.dataset.loadStyle);
                        })
                    }
                }
            }

        }
    })*/

    const backtopEl = document.querySelector('.backtop');
    const headerEl = document.querySelector('#header');
    backtopEl.addEventListener('click', (e) => {
        e.preventDefault();
        scroll.scrollTo(headerEl);
    });
});