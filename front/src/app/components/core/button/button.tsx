'use client'

import React from 'react';
import classNames from 'classnames';

import "./button.scss";

interface ButtonProps {
  title: string,
  onClick: () => void,
  className?: string,
  type?: "button" | "submit";
}

const Button: React.FC<ButtonProps> = ({ title, onClick, className, type = "button" }) => {
  const buttonClass = classNames('button', className);
  return (
    <button type={type} onClick={onClick} className={buttonClass}>{title}</button>
  );
}

export default Button;