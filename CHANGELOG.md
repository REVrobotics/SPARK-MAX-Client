# SPARK MAX Client Changelog
All releases of the SPARK MAX Client follow [semantic versioning](https://semver.org/).
Major builds are incompatible with older ones, minor builds are backwards-compatible, and patches could be released to current
major/minor builds.

Current application changes that are implemented but not yet released will be denoted with an _* (asterisk)_.

### v0.13.3* - 1/8/2019 - Addition: About Tab
Major/Breaking features:
* _None_

Minor features:
* Added 'About' tab to the client. This displays license and copyright information as well as SPARK MAX server/client versions.

Bug fixes/patches:
* Fixed 'Run' tab setting controller setpoint after disabling and returning to the tab.
* Fixed text for limit switch labels, they now display "Normally Closed" and "Normally Open".
* Fixed improper types on limit switch polarities and limit switch enables.
* Added client communication in checking for updates.
* Fixed firmware update messages sometimes duplicating.


### v0.11.15 - 1/5/2019 - Happy Kickoff Everybody!
Major/Breaking features:
* _None_

Minor features:
* _None_

Bug fixes:
* Installer now comes with the SPARK MAX firmware driver.
* Installer now comes with the STM32 virtual COM port driver.
* Client now downloads latest firmware on application boot regardless of controller connection status.
* Added additional loading on firmware download.

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