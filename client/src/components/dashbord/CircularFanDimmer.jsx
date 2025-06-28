import React from 'react';
import CircularSlider from '@fseehawer/react-circular-slider'; // Use default export
import FanIcon from '@mui/icons-material/AcUnit'; // Fan icon

const CircularFanDimmer = ({ value, onChange }) => {
  return (
    <div style={{ width: '150px', height: '150px', position: 'relative' }}>
      <CircularSlider
        width={150}
        min={0}
        max={100}
        dataIndex={value}
        knobColor="#180d54"
        progressSize={10}

        progressColorFrom="#1584d4"
        progressColorTo="#0d63a1"
        trackColor="#E0E0E0"
        onChange={onChange}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        {/* <FanIcon style={{ fontSize: '40px', color: '#FFA500' }} /> */}
        {/* <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{value}%</div> */}
      </div>
    </div>
  );
};

export default CircularFanDimmer;