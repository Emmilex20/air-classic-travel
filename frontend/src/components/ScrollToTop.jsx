// frontend/src/components/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 *
 * This component scrolls the window to the top (0,0) whenever the
 * route's pathname changes. It leverages the `useLocation` hook from
 * react-router-dom and a `useEffect` hook.
 *
 * It should be placed inside the <Router> component but outside the <Routes>
 * in your main App.jsx file to ensure it's rendered globally and listens
 * to all route changes.
 */
function ScrollToTop() {
    const { pathname } = useLocation(); // Get the current pathname from the URL

    // useEffect hook to run side effects after render.
    // It will run whenever `pathname` changes.
    useEffect(() => {
        // Scroll to the top of the window
        window.scrollTo(0, 0);
        // console.log(`Scrolled to top on route change to: ${pathname}`); // Optional: for debugging
    }, [pathname]); // Dependency array: effect runs when pathname changes

    // This component doesn't render any UI, it just performs a side effect.
    return null;
}

export default ScrollToTop;