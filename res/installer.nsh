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