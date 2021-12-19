const { NearestScanner } = require('@toio/scanner');
const GamePad = require('node-gamepad');

const DEFAULT_BUFFER = [5, 255, 4, 0, 0, 0, 0, 0, 0, 0, 0];
const INDEXES = {
  rumbleLeft: 4,
  rumbleRight: 5,
  red: 6,
  green: 7,
  blue: 8,
  flashOn: 9,
  flashOff: 10
};

const config = {
  threshold: 1,
  joystick: 1,
  speedLeft: 0,
  speedRight: 0
};

// https://github.com/rdepena/node-dualshock-controller から拝借
const setExtra = (controller, data) => {
  const buff = DEFAULT_BUFFER.slice();
  Object.keys(data).forEach((k) => {
    buff[INDEXES[k]] = data[k];
  });
  controller._usb.write(buff);
};

function initController(thresholdChangeListener) {
  // 第二世代(CUH-ZCT2)の DUALSHOCK4 なので、第二引数を自分で設定する必要があった
  // 第一世代(CUH-ZCT1)の場合は、第二引数は不要
  const controller = new GamePad('ps4/dualshock4', {
    vendorID: 0x054c,
    productID: 0x09cc
  });

  controller.on('dpadUp:press', () => {
    if (config.threshold < 10) {
      config.threshold++;
    }
    thresholdChangeListener();
  });

  controller.on('dpadDown:press', () => {
    if (1 < config.threshold) {
      config.threshold--;
    }
    thresholdChangeListener();
  });

  controller.on('l3:press', () => {
    config.joystick = 1;
    console.log('左スティックモード');
  });

  controller.on('r3:press', () => {
    config.joystick = 2;
    console.log('左右スティックモード');
  });

  controller.on('left:move', (evt) => {
    const x = ((evt.x - 128) / 128) * 100;
    const y = -1 * ((evt.y - 128) / 128) * 100;

    const { joystick } = config;
    if (joystick === 1) {
      if (Math.abs(x) < 10 && Math.abs(y) < 10) {
        config.speedLeft = 0;
        config.speedRight = 0;
        return;
      }

      // なんか角度を計算して頑張る！ベストな計算かはわからない！
      const angle = Math.atan2(y, x);
      config.speedLeft = Math.abs(y) * Math.sin(angle) + Math.abs(x) * Math.cos(angle);
      config.speedRight = Math.abs(y) * Math.sin(angle) - Math.abs(x) * Math.cos(angle);
    } else if (joystick === 2) {
      config.speedLeft = y;
    }
  });

  controller.on('right:move', (evt) => {
    const y = -1 * ((evt.y - 128) / 128) * 100;

    const { joystick } = config;
    if (joystick === 2) {
      config.speedRight = y;
    }
  });

  controller.connect();
  return controller;
}

async function main() {
  const cube = await new NearestScanner().start();
  await cube.connect();

  const setThreshold = (threshold) => {
    console.log('衝突閾値(低いほうが敏感):', threshold);
    cube.configurationCharacteristic.characteristic.write(Buffer.from([0x06, 0x00, threshold]), false);
  };

  const controller = initController(() => {
    setThreshold(config.threshold);
  });

  cube.on('sensor:collision', (evt) => {
    console.log(evt);
    if (evt.isCollisionDetected) {
      cube.playPresetSound(4);
      setExtra(controller, { rumbleLeft: 128, rumbleRight: 128 });
      setTimeout(() => {
        setExtra(controller, { rumbleLeft: 0, rumbleRight: 0 });
      }, 1000);
    }
  });

  console.log('左スティックモード');
  setThreshold(config.threshold);
  setInterval(() => {
    const { speedLeft, speedRight } = config;
    cube.move(speedLeft, speedRight, 100);
  }, 10);
}

main();
