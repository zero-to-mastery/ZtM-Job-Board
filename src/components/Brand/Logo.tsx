import React from 'react';

export const Logo = (props: any) => {
  const { style } = props;
  return (
    <div style={style}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 968 292"
      >
        <g id="logo" transform="translate(-160 -113.871)">
          <circle
            id="Elipse_2"
            data-name="Elipse 2"
            cx="146"
            cy="146"
            r="146"
            transform="translate(160 113.871)"
            fill="#b8e1ee"
          />
          <text
            id="Job-board"
            transform="translate(191 328.871)"
            font-size="208"
            font-family="Helvetica"
          >
            <tspan x="0" y="0">
              Job-board
            </tspan>
          </text>
        </g>
      </svg>
    </div>
  );
};
