# SPARK MAX Client Changelog
All releases of the SPARK MAX Client follow [semantic versioning](https://semver.org/).
Major builds are incompatible with older ones, minor builds are backwards-compatible, and patches could be released to current
major/minor builds.

### v0.11.13 - 1/3/2019
Major/Breaking features:
* _None_

Minor features:
* _None_

Bug fixes:
* Installer now comes with the SPARK MAX firmware driver.
* Installer now comes with the STM32 virtual COM port driver.

### v0.11.11 - 12/28/2018
Major/Breaking features:
* _None_

Minor features:
* _None_

Bug fixes:
* Fixed some language around the application
* Firmware tab now defaults to the firmware directory of the application.

### v0.11.9 - 12/27/2018
Major/Breaking features:
* _None_

Minor features:
* _None_

Bug fixes:
* Fixed controller sometimes not connecting properly due to server always rending root response on connection.
* Fixed PID tab crashing when controller not connected but the application thought it was.
* Fixed firmware tab not reconnecting to the motor controller properly after successful firmware load.
* Fixed MotorTypeSelect not being updated when the motor controller connects.
* Fixed motor controller still running once you disconnect from it in the run tab.
* Added parameters to the MotorConfiguration that were not previously defined.

### v0.11.3 - 12/24/2018
Major/Breaking features:
* _None_

Minor features:
* _None_

Bug Fixes:
* Sanitization and allows float inputs in NumericInput components.
* No longer duplicates firmware file download.
* Firmware update no longer requires an internet connection.