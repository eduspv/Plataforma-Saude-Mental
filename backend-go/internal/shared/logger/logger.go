package logger

import "log"

var isDevelopment bool

func Init(appEnv string) {
	isDevelopment = appEnv == "development"
}

func Debug(format string, v ...interface{}) {
	if isDevelopment {
		log.Printf("[DEBUG] "+format, v...)
	}
}
