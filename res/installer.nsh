!include "LogicLib.nsh"
!include "x64.nsh"

!define PRODUCT_GROUP "REV Robotics"
!define DEFAULT_INST_DIR "$PROGRAMFILES\${PRODUCT_GROUP}\${PRODUCT_NAME}"

!macro preInit
	SetRegView 64
	WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "${DEFAULT_INST_DIR}"
	WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "${DEFAULT_INST_DIR}"
	SetRegView 32
	WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "${DEFAULT_INST_DIR}"
	WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "${DEFAULT_INST_DIR}"
!macroend

!macro customInstall
  Push $R0
  Push $R1

  ; check if Windows 10 family (CurrentMajorVersionNumber is new, introduced in Windows 10)
  ReadRegStr $R0 HKLM \
    "SOFTWARE\Microsoft\Windows NT\CurrentVersion" CurrentMajorVersionNumber

  StrCmp $R0 '' 0 lbl_winnt

  ClearErrors

  ; check if Windows NT family
  ReadRegStr $R0 HKLM \
  "SOFTWARE\Microsoft\Windows NT\CurrentVersion" CurrentVersion

  IfErrors 0 lbl_winnt

  ; we are not NT
  ReadRegStr $R0 HKLM \
  "SOFTWARE\Microsoft\Windows\CurrentVersion" VersionNumber

  StrCpy $R1 $R0 1
  StrCmp $R1 '4' 0 lbl_error

  StrCpy $R1 $R0 3

  StrCmp $R1 '4.0' lbl_win32_95
  StrCmp $R1 '4.9' lbl_win32_ME lbl_win32_98

  lbl_win32_95:
    StrCpy $R0 '95'
  Goto lbl_done

  lbl_win32_98:
    StrCpy $R0 '98'
  Goto lbl_done

  lbl_win32_ME:
    StrCpy $R0 'ME'
  Goto lbl_done

  lbl_winnt:

  StrCpy $R1 $R0 1

  StrCmp $R1 '3' lbl_winnt_x
  StrCmp $R1 '4' lbl_winnt_x

  StrCpy $R1 $R0 3

  StrCmp $R1 '5.0' lbl_winnt_2000
  StrCmp $R1 '5.1' lbl_winnt_XP
  StrCmp $R1 '5.2' lbl_winnt_2003
  StrCmp $R1 '6.0' lbl_winnt_vista
  StrCmp $R1 '6.1' lbl_winnt_7
  StrCmp $R1 '6.2' lbl_winnt_8
  StrCmp $R1 '6.3' lbl_winnt_81
  StrCmp $R1 '10' lbl_winnt_10 ; CurrentMajorVersionNumber is a dword

  StrCpy $R1 $R0 4

  StrCmp $R1 '10.0' lbl_winnt_10 ; This can never happen?
  Goto lbl_error

  lbl_winnt_x:
    StrCpy $R0 "NT $R0" 6
  Goto lbl_done

  lbl_winnt_2000:
    Strcpy $R0 '2000'
  Goto lbl_done

  lbl_winnt_XP:
    Strcpy $R0 'XP'
  Goto lbl_done

  lbl_winnt_2003:
    Strcpy $R0 '2003'
  Goto lbl_done

  lbl_winnt_vista:
    Strcpy $R0 'Vista'
  Goto lbl_done

  lbl_winnt_7:
    Strcpy $R0 '7'
  Goto lbl_done

  lbl_winnt_8:
    Strcpy $R0 '8'
  Goto lbl_done

  lbl_winnt_81:
    Strcpy $R0 '8.1'
  Goto lbl_done

  lbl_winnt_10:
    Strcpy $R0 '10.0'
  Goto lbl_done

  lbl_error:
    Strcpy $R0 ''
  lbl_done:

  ; From here on out, $R0 contains our current windows version.
  Pop $R1

  ; Now, we check for windows versions as well as type of cpu.
  ; Windows 10 only needs the MAX firmware driver, while other versions (8.1, 8, and 7) need the STM driver.
  ${If} $R0 == "10.0"
    ${If} ${RunningX64}
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win10\dpinst_amd64.exe"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win10\sttube.cat"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win10\STtube.inf"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win10\x64\STTub30.sys"
      File "${BUILD_RESOURCES_DIR}\STM32\Win8\stmcdc.cat"
      File "${BUILD_RESOURCES_DIR}\STM32\Win8\stmcdc.inf"
      ExecWait "$INSTDIR\dpinst_amd64.exe"
    ${Else}
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win10\dpinst_x86.exe"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win10\sttube.cat"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win10\STtube.inf"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win10\x86\STTub30.sys"
      File "${BUILD_RESOURCES_DIR}\STM32\Win8\stmcdc.cat"
      File "${BUILD_RESOURCES_DIR}\STM32\Win8\stmcdc.inf"
      ExecWait "$INSTDIR\dpinst_x86.exe"
    ${EndIf}
  ${ElseIf} $R0 == "8.1"
    ${If} ${RunningX64}
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win8.1\x64\dpinst_amd64.exe"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win8.1\x64\sttube.cat"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win8.1\x64\STtube.inf"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win8.1\x64\x64\STTub30.sys"
      File "${BUILD_RESOURCES_DIR}\STM32\Win8\stmcdc.cat"
      File "${BUILD_RESOURCES_DIR}\STM32\Win8\stmcdc.inf"
      ExecWait "$INSTDIR\dpinst_amd64.exe"
    ${Else}
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win8.1\x86\dpinst_x86.exe"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win8.1\x86\sttube.cat"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win8.1\x86\STtube.inf"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win8.1\x86\x86\STTub30.sys"
      File "${BUILD_RESOURCES_DIR}\STM32\Win8\stmcdc.cat"
      File "${BUILD_RESOURCES_DIR}\STM32\Win8\stmcdc.inf"
      ExecWait "$INSTDIR\dpinst_x86.exe"
    ${EndIf}
  ${ElseIf} $R0 == "8"
    ${If} ${RunningX64}
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win8\x64\dpinst_amd64.exe"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win8\x64\sttube.cat"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win8\x64\STtube.inf"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win8\x64\x64\STTub30.sys"
      File "${BUILD_RESOURCES_DIR}\STM32\Win8\stmcdc.cat"
      File "${BUILD_RESOURCES_DIR}\STM32\Win8\stmcdc.inf"
      ExecWait "$INSTDIR\dpinst_amd64.exe"
    ${Else}
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win8\x86\dpinst_x86.exe"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win8\x86\sttube.cat"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win8\x86\STtube.inf"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win8\x86\x86\STTub30.sys"
      File "${BUILD_RESOURCES_DIR}\STM32\Win8\stmcdc.cat"
      File "${BUILD_RESOURCES_DIR}\STM32\Win8\stmcdc.inf"
      ExecWait "$INSTDIR\dpinst_x86.exe"
    ${EndIf}
  ${ElseIf} $R0 == "7"
    ${If} ${RunningX64}
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win7\x64\dpinst_amd64.exe"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win7\x64\sttube.cat"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win7\x64\STtube.inf"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win7\x64\x64\STTub30.sys"
      File "${BUILD_RESOURCES_DIR}\STM32\Win7\stmcdc.cat"
      File "${BUILD_RESOURCES_DIR}\STM32\Win7\stmcdc.inf"
      ExecWait "$INSTDIR\dpinst_amd64.exe"
    ${Else}
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win7\x86\dpinst_x86.exe"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win7\x86\sttube.cat"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win7\x86\STtube.inf"
      File "${BUILD_RESOURCES_DIR}\SPARK MAX\Win7\x86\x86\STTub30.sys"
      File "${BUILD_RESOURCES_DIR}\STM32\Win7\stmcdc.cat"
      File "${BUILD_RESOURCES_DIR}\STM32\Win7\stmcdc.inf"
      ExecWait "$INSTDIR\dpinst_x86.exe"
    ${EndIf}
  ${EndIf}

  ; Check for VC++ Redist already installed
  ; ${If} ${RunningX64}
  ;   ReadRegStr $1 HKLM "SOFTWARE\Microsoft\VisualStudio\10.0\VC\VCRedist\x64" "Installed"
  ;   StrCmp $1 1 installed
  ; ${Else}
  ;   ReadRegStr $1 HKLM "SOFTWARE\Microsoft\VisualStudio\10.0\VC\VCRedist\x86" "Installed"
  ;   StrCmp $1 1 installed
  ; ${EndIf}

  ; VC ++ 13 shouldn't be necessary anymore since STTubeDevice30 was rebuild with 2019
  ${If} ${RunningX64}
    ; File "${BUILD_RESOURCES_DIR}\VC++ 2013\vcredist_x64.exe"
    ; ExecWait "${BUILD_RESOURCES_DIR}\VC++ 2013\vcredist_x64.exe"
    
    File "${BUILD_RESOURCES_DIR}\VC++\VC_redist.x64.exe"
    ExecWait "$INSTDIR\VC_redist.x64.exe"
  ${Else}
    ; File "${BUILD_RESOURCES_DIR}\VC++ 2013\vcredist_x86.exe"
    ; ExecWait "${BUILD_RESOURCES_DIR}\VC++ 2013\vcredist_x86.exe"
    File "${BUILD_RESOURCES_DIR}\VC++\VC_redist.x86.exe"
    ExecWait "$INSTDIR\VC_redist.x86.exe"
  ${EndIf}

  ; installed:
  ; we are done

!macroend