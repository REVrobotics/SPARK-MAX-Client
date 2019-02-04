# SPARK MAX Client Changelog
All releases of the SPARK MAX Client follow [semantic versioning](https://semver.org/).
Major builds are incompatible with older ones, minor builds are backwards-compatible, and patches could be released to current
major/minor builds.

Current application changes that are implemented but not yet released will be denoted with an _* (asterisk)_.

### v1.0.0* - 1/29/2019 - Updated SPARK MAX Server Executable and Major UI improvements
Major/Breaking features:
* Updated SPARK Server executable and Command/Types protocol buffers.

Minor features:
* MotorConfiguration class can now be completely serialized/deserialized into JSON format.
* All text fields now provide real-time feedback in terms of their validity to the SPARK Server
* Invalid fields will reveal a blinking question circle. Hover over it to see why the value is invalid.
* In brushless mode, only the 'Hall Effect' sensor may be selected, and will default when brushless is selected.
* 'Run' tab now provides feedback on invalid/valid PIDF values.

Bug fixes/patches:
* Ramp rate has been changed to %/s (seconds to full speed)
* Motor deadband slider now only goes to values 0 to 0.3
* Client now waits for parameters from the SPARK Server before anything may be interacted with.
* Fixed firmware update requiring recovery update for firmware versions 1.1.x
* Properly disconnects SPARK MAX controller on application close.

### v0.13.4 - 1/12/2019 - Added VC++ 2013 Installation
Major/Breaking features:
* _None_

Minor features:
* _None_

Bug fixes/patches:
* Added VC++ 2013 to the application NSIS installation.
* Code signed the client executable

### v0.13.4 - 1/12/2019 - Addition: About Tab and Fixes
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
* Removed weird boxes appearing around all inputs.


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