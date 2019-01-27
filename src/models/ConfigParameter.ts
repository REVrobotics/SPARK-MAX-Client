enum ConfigParameter {
  /*
  * CAN ID
  * @default 0
  * @type uint
  */
  kCanID = 0,

  /*
  * Input mode, this parameter is read only and the input mode is detected by t
  * he firmware automatically, results are %Input Mode%
  * @default 0
  * @type Input Mode
  */
  kInputMode = 1,

  /*
  * Motor Type, options are %Motor Type%
  * @default BRUSHLESS
  * @type Motor Type
  */
  kMotorType = 2,

  /*
  * Electrical degree of offset from the hall sensor edge to motor commutation.
  *  This is currently disabled
  * @default 0
  * @type float32
  * @unit Degrees
  */
  kCommAdvance = 3,

  /*
  * Sensor Type, options are %Sensor Type%
  * @default HALL_EFFECT
  * @type Sensor Type
  */
  kSensorType = 4,

  /*
  * Control Type, this is a read only parameter of the currently active control
  *  type. Options are %Ctrl Type%
  * @default CTRL_DUTY_CYCLE
  * @type Ctrl Type
  */
  kCtrlType = 5,

  /*
  * State of the half bridge when the motor controller commands zero output or
  * is disabled. Options are %Idle Mode%
  * @default IDLE_COAST
  * @type Idle Mode
  */
  kIdleMode = 6,

  /*
  * Percent of the input which results in zero output for PWM mode
  * @default 0.05
  * @type float32
  * @unit Percent
  */
  kInputDeadband = 7,

  /*
  * Read only parameter showing the 32-bit firmware version. The first byte is
  * the major build, the second byte is in the minor build, the last two bytes
  *  are the build
  * @default 0
  * @type Firmware
  */
  kFirmwareVer = 8,

  /*
  * Electrical offset of the hall sensor compared to the motor phases in degree
  * s. Typically this is either 0, 60, 120. This feature is disabled
  * @default 60
  * @type int
  * @unit Degrees
  */
  kHallOffset = 9,

  /*
  * Number of pole pairs for the brushless motor. This is the number of poles/2
  *  and can be determined by either counting the number of magents or countin
  * g the number of windings and dividing by 3. This is an important term for
  * speed regulation to properly calculate the speed.
  * @default 7
  * @type uint
  */
  kPolePairs = 10,

  /*
  * If the half bridge detects this current limit, it will disable the motor dr
  * iver for a fixed amount of time set by kCurrentChopCycles. This is a low s
  * ophistication 'current control'. Set to 0 to disable. The max value is 125
  * .
  * @default 115
  * @type float32
  * @unit Amps
  */
  kCurrentChop = 11,

  /*
  * Number of PWM Cycles for the h-bridge to be off in the case that the curren
  * t limit is set. Min = 1, multiples of PWM period (50us). During this time
  * the current will be recircuilating through the low side MOSFETs, so instea
  * d of 'freewheeling' the diodes, the bridge will be in brake mode during th
  * is time.
  * @default 0
  * @type uint
  */
  kCurrentChopCycles = 12,

  /*
  * Perportional gain constant for gain slot 0.
  * @default 0
  * @type float32
  */
  kP_0 = 13,

  /*
  * Integral gain constant for gain slot 0.
  * @default 0
  * @type float32
  */
  kI_0 = 14,

  /*
  * Derivative gain constant for gain slot 0.
  * @default 0
  * @type float32
  */
  kD_0 = 15,

  /*
  * Feed Forward gain constant for gain slot 0.
  * @default 0
  * @type float32
  */
  kF_0 = 16,

  /*
  * Integrator zone constant for gain slot 0. The PIDF loop integrator will onl
  * y accumulate while the setpoint is within IZone of the target.
  * @default 0
  * @type float32
  */
  kIZone_0 = 17,

  /*
  * PIDF derivative filter constant for gain slot 0.
  * @default 0
  * @type float32
  */
  kDFilter_0 = 18,

  /*
  * Max output constant for gain slot 0. This is the max output of the controll
  * er.
  * @default 0
  * @type float32
  */
  kOutputMin_0 = 19,

  /*
  * Min output constant for gain slot 0. This is the min output of the controll
  * er.
  * @default 0
  * @type float32
  */
  kOutputMax_0 = 20,

  /*
  * Perportional gain constant for gain slot 1.
  * @default 0
  * @type float32
  */
  kP_1 = 21,

  /*
  * Integral gain constant for gain slot 1.
  * @default 0
  * @type float32
  */
  kI_1 = 22,

  /*
  * Derivative gain constant for gain slot 1.
  * @default 0
  * @type float32
  */
  kD_1 = 23,

  /*
  * Feed Forward gain constant for gain slot 1.
  * @default 0
  * @type float32
  */
  kF_1 = 24,

  /*
  * Integrator zone constant for gain slot 1. The PIDF loop integrator will onl
  * y accumulate while the setpoint is within IZone of the target.
  * @default 0
  * @type float32
  */
  kIZone_1 = 25,

  /*
  * PIDF derivative filter constant for gain slot 1.
  * @default 0
  * @type float32
  */
  kDFilter_1 = 26,

  /*
  * Max output constant for gain slot 1. This is the max output of the controll
  * er.
  * @default 0
  * @type float32
  */
  kOutputMin_1 = 27,

  /*
  * Min output constant for gain slot 1. This is the min output of the controll
  * er.
  * @default 0
  * @type float32
  */
  kOutputMax_1 = 28,

  /*
  * Perportional gain constant for gain slot 3.
  * @default 0
  * @type float32
  */
  kP_2 = 29,

  /*
  * Integral gain constant for gain slot 3.
  * @default 0
  * @type float32
  */
  kI_2 = 30,

  /*
  * Derivative gain constant for gain slot 3.
  * @default 0
  * @type float32
  */
  kD_2 = 31,

  /*
  * Feed Forward gain constant for gain slot 3.
  * @default 0
  * @type float32
  */
  kF_2 = 32,

  /*
  * Integrator zone constant for gain slot 3. The PIDF loop integrator will onl
  * y accumulate while the setpoint is within IZone of the target.
  * @default 0
  * @type float32
  */
  kIZone_2 = 33,

  /*
  * PIDF derivative filter constant for gain slot 3.
  * @default 0
  * @type float32
  */
  kDFilter_2 = 34,

  /*
  * Max output constant for gain slot 3. This is the max output of the controll
  * er.
  * @default 0
  * @type float32
  */
  kOutputMin_2 = 35,

  /*
  * Min output constant for gain slot 3. This is the min output of the controll
  * er.
  * @default 0
  * @type float32
  */
  kOutputMax_2 = 36,

  /*
  * Perportional gain constant for gain slot 4.
  * @default 0
  * @type float32
  */
  kP_3 = 37,

  /*
  * Integral gain constant for gain slot 4.
  * @default 0
  * @type float32
  */
  kI_3 = 38,

  /*
  * Derivative gain constant for gain slot 4.
  * @default 0
  * @type float32
  */
  kD_3 = 39,

  /*
  * Feed Forward gain constant for gain slot 4.
  * @default 0
  * @type float32
  */
  kF_3 = 40,

  /*
  * Integrator zone constant for gain slot 4. The PIDF loop integrator will onl
  * y accumulate while the setpoint is within IZone of the target.
  * @default 0
  * @type float32
  */
  kIZone_3 = 41,

  /*
  * PIDF derivative filter constant for gain slot 4.
  * @default 0
  * @type float32
  */
  kDFilter_3 = 42,

  /*
  * Max output constant for gain slot 4. This is the max output of the controll
  * er.
  * @default 0
  * @type float32
  */
  kOutputMin_3 = 43,

  /*
  * Min output constant for gain slot 4. This is the min output of the controll
  * er.
  * @default 0
  * @type float32
  */
  kOutputMax_3 = 44,

  /*
  * Reserved
  * @default 0
  * @type uint
  */
  kReserved = 45,

  /*
  * Simple scalar for all units in all closed loop control modes to scale units
  *  to native. Use this to scale the output to things like gear ratios or uni
  * t conversions. Unit for this is 'distance per encoder tick'
  * @default 1
  * @type float32
  */
  kOutputRatio = 46,

  /*
  * Low 32-bits of unique 96-bit serial number
  * @default 0
  * @type uint
  */
  kSerialNumberLow = 47,

  /*
  * Middle 32-bits of unique 96-bit serial number
  * @default 0
  * @type uint
  */
  kSerialNumberMid = 48,

  /*
  * High 32-bits of unique 96-bit serial number
  * @default 0
  * @type uint
  */
  kSerialNumberHigh = 49,

  /*
  * Limit switch polarity. Default is Normally Open (0), and can be set to Norm
  * ally Closed (1)
  * @default 0
  * @type bool
  */
  kLimitSwitchFwdPolarity = 50,

  /*
  * Limit switch polarity. Default is Normally Open (0), and can be set to Norm
  * ally Closed (1)
  * @default 0
  * @type bool
  */
  kLimitSwitchRevPolarity = 51,

  /*
  * Limit switch enable, enabled by default
  * @default 1
  * @type bool
  */
  kHardLimitFwdEn = 52,

  /*
  * Limit switch enable, enabled by default
  * @default 1
  * @type bool
  */
  kHardLimitRevEn = 53,

  /*
  * Soft limit enable, disabled by default
  * @default 0
  * @type bool
  */
  kSoftLimitFwdEn = 54,

  /*
  * Soft limit enable, disabled by default
  * @default 0
  * @type bool
  */
  kSoftLimitRevEn = 55,

  /*
  * Voltage ramp rate active for all control modes in % output per second, a va
  * lue of 0 disables this feature. All APIs take the reciprocol to make the u
  * nit 'time from 0 to full'.
  * @default 0
  * @type float32
  * @unit V/s
  */
  kRampRate = 56,

  /*
  * CAN EXTID of the message with data to follow
  * @default 0
  * @type uint
  */
  kFollowerID = 57,

  /*
  * Special configuration register for setting up to follow on a repeating mess
  * age (follower mode). CFG[0] to CFG[3] where CFG[0] is the motor output sta
  * rt bit (LSB), CFG[1] is the motor output stop bit (MSB). CFG[0] - CFG[1] d
  * etermines edieness. CFG[2] bits determine sign mode and inverted, CFG[3] s
  * ets a preconfigured controller (0x1A = REV, 0x1B = Talon/Victor style as o
  * f 2018 season)
  * @default 0
  * @type uint
  */
  kFollowerConfig = 58,

  /*
  * Smart Current Limit at stall, or any RPM less than kSmartCurrentConfig RPM.
  *
  * @default 80
  * @type uint
  * @unit A
  */
  kSmartCurrentStallLimit = 59,

  /*
  * Smart current limit at free speed
  * @default 20
  * @type uint
  * @unit A
  */
  kSmartCurrentFreeLimit = 60,

  /*
  * Smart current limit RPM value to start linear reduction of current limit. S
  * et this > free speed to disable.
  * @default 10000
  * @type uint
  */
  kSmartCurrentConfig = 61,

  /*
  *
  * @default 0
  * @type uint
  * @unit ms
  */
  kSmartCurrentReserved = 62,

  /*
  * Kv in RPM/V
  * @default 480
  * @type uint
  * @unit RPM/V
  */
  kMotorKv = 63,

  /*
  * Motor ph-ph resistance
  * @default 35000
  * @type uint
  * @unit uohm
  */
  kMotorR = 64,

  /*
  * Motor ph-ph inductance
  * @default 3800
  * @type uint
  * @unit nH
  */
  kMotorL = 65,

  /*
  *
  * @default 0
  * @type uint
  */
  kMotorRsvd1 = 66,

  /*
  *
  * @default 0
  * @type uint
  */
  kMotorRsvd2 = 67,

  /*
  *
  * @default 0
  * @type uint
  */
  kMotorRsvd3 = 68,

  /*
  * Number of encoder counts in a single revolution, counting every edge on the
  *  A and B lines of a quadrature encoder. (Note: This is different than the
  * CPR spec of the encoder which is 'Cycles per revolution'. This value is 4
  * * CPR.
  * @default 4096
  * @type uint
  */
  kEncoderCountsPerRev = 69,

  /*
  * Number of samples to average for velocity data based on quadrature encoder
  * input. This value can be between 1 and 64.
  * @default 64
  * @type uint
  */
  kEncoderAverageDepth = 70,

  /*
  * Delta time value for encoder velocity measurement in 500us increments. The
  * velocity calculation will take delta the current sample, and the sample x
  * *  500us behind, and divide by this the sample delta time. Can be any numb
  * er between 1 and 255
  * @default 200
  * @type uint
  * @unit per 500us
  */
  kEncoderSampleDelta = 71,

  /*
  *
  * @default 0
  * @type uint
  */
  kEncoderRsvd0 = 72,

  /*
  *
  * @default 0
  * @type uint
  */
  kEncoderRsvd1 = 73,

  /*
  * Only available in closed loop modes
  *
  * 0 = Disabled
  * 1 = Control loop voltage output mode
  * 2 = Voltage compensation mode
  *
  * @default 0
  * @type uint
  */
  kClosedLoopVoltageMode = 74,

  /*
  * In Voltage compensation mode, this is the max scaled voltage.
  *
  * @default 0
  * @type float32
  */
  kCompensatedNominalVoltage = 75
}