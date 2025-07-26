import React from 'react';
import { SvgXml } from 'react-native-svg';

const homeSvg = `<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20.955 8.01002L14.405 2.77002C13.125 1.75002 11.125 1.74002 9.85502 2.76002L3.30502 8.01002C2.36502 8.76002 1.79502 10.26 1.99502 11.44L3.25502 18.98C3.54502 20.67 5.11502 22 6.82502 22H17.425C19.115 22 20.715 20.64 21.005 18.97L22.265 11.43C22.445 10.26 21.875 8.76002 20.955 8.01002ZM12.875 18C12.875 18.41 12.535 18.75 12.125 18.75C11.715 18.75 11.375 18.41 11.375 18V15C11.375 14.59 11.715 14.25 12.125 14.25C12.535 14.25 12.875 14.59 12.875 15V18Z" fill="currentColor"/>
</svg>`;

const shortpickSvg = `<svg width="12" height="12" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14.625 6.83494C16.2917 7.79719 16.2917 10.2028 14.625 11.1651L4.125 17.2272C2.45833 18.1895 0.375 16.9867 0.375 15.0622V2.93782C0.375 1.01332 2.45833 -0.189491 4.125 0.772759L14.625 6.83494Z" fill="currentColor"/>
</svg>`;

const dogamSvg = `<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.875 5V19C21.875 20.1 20.975 21 19.875 21H7.875C5.665 21 3.875 19.21 3.875 17V7C3.875 4.79 5.665 3 7.875 3H17.875C19.975 3 21.875 5 21.875 5ZM7.875 19H18.875V17H7.875C6.775 17 5.875 17.9 5.875 19C5.875 20.1 6.775 21 7.875 21Z" fill="currentColor"/>
</svg>`;

const profileSvg = `<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.375 12C14.5841 12 16.375 10.2091 16.375 8C16.375 5.79086 14.5841 4 12.375 4C10.1659 4 8.375 5.79086 8.375 8C8.375 10.2091 10.1659 12 12.375 12Z" fill="currentColor"/>
<path d="M12.375 14C7.97502 14 4.375 17.6 4.375 22H20.375C20.375 17.6 16.775 14 12.375 14Z" fill="currentColor"/>
</svg>`;

interface IconProps {
  color: string;
  size: number;
}

export const HomeIcon: React.FC<IconProps> = ({ color, size }) => (
  <SvgXml xml={homeSvg} width={size} height={size} color={color} />
);

export const ShortPickIcon: React.FC<IconProps> = ({ color, size }) => (
  <SvgXml xml={shortpickSvg} width={size} height={size} color={color} />
);

export const DogamIcon: React.FC<IconProps> = ({ color, size }) => (
  <SvgXml xml={dogamSvg} width={size} height={size} color={color} />
);

export const ProfileIcon: React.FC<IconProps> = ({ color, size }) => (
  <SvgXml xml={profileSvg} width={size} height={size} color={color} />
);