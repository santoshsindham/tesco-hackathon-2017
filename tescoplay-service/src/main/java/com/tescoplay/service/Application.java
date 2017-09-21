package com.tescoplay.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationListener;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.event.ContextClosedEvent;

@SpringBootApplication
public class Application {

	private static Logger logger = LoggerFactory.getLogger(Application.class);

	public static void main(String[] args) {

		ConfigurableApplicationContext cac = SpringApplication.run(Application.class, args);
		cac.addApplicationListener(new ApplicationListener<ContextClosedEvent>() {
			@Override
			public void onApplicationEvent(ContextClosedEvent event) {
				try {
					TescoPlayController.shutdown();
					Thread.sleep(15000);
					System.exit(0);
				} catch (Exception e) {
					logger.error("Error", e);
				}
			}
		});
	}
}
