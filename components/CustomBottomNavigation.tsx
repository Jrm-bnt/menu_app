import React from 'react';
import { BottomNavigation as PaperBottomNavigation } from 'react-native-paper';

// This is a wrapper component to fix the key prop warning in react-native-paper
// It simply passes the props to the BottomNavigation component
const CustomBottomNavigation = (props: any) => {
  return <PaperBottomNavigation {...props} />;
};

export default CustomBottomNavigation;
