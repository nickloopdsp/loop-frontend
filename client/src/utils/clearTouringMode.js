// Quick utility to clear touring mode custom layout
// Run this in browser console or call from anywhere in the app

export function clearTouringModeLayout() {
  try {
    // Get current custom layouts from localStorage
    const customLayouts = JSON.parse(localStorage.getItem('loop-custom-layouts') || '{}');
    
    // Remove touring mode layout
    delete customLayouts.touring;
    
    // Save back to localStorage
    localStorage.setItem('loop-custom-layouts', JSON.stringify(customLayouts));
    
    console.log('Touring mode layout cleared successfully');
    
    // Refresh the page to see changes
    window.location.reload();
  } catch (error) {
    console.error('Error clearing touring mode layout:', error);
  }
}

// Also provide a function to clear all custom layouts
export function clearAllCustomLayouts() {
  try {
    localStorage.removeItem('loop-custom-layouts');
    console.log('All custom layouts cleared successfully');
    window.location.reload();
  } catch (error) {
    console.error('Error clearing custom layouts:', error);
  }
}

// Make functions available globally for console use
if (typeof window !== 'undefined') {
  window.clearTouringModeLayout = clearTouringModeLayout;
  window.clearAllCustomLayouts = clearAllCustomLayouts;
} 