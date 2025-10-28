/*
Jeffrey Jenson
TESD 1800 – Computer Programming II
Module 6 – JavaFX Controls
Exercise 16-21: Implementation
Date: 10/28/2025
*/

import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.layout.VBox;
import javafx.scene.media.Media;
import javafx.scene.media.MediaPlayer;
import javafx.stage.Stage;
import javafx.util.Duration;

public class Exercise16_21 extends Application {

    private int timeLeft = 0;
    private Timeline timeline;
    private MediaPlayer player;

    @Override
    public void start(Stage stage) {
        // input and display
        TextField tfSeconds = new TextField();
        tfSeconds.setPromptText("Enter seconds and press Enter");
        Label lblTime = new Label("Ready");

        // timeline that updates every second
        timeline = new Timeline(new KeyFrame(Duration.seconds(1), e -> {
            if (timeLeft > 0) {
                timeLeft--;
                lblTime.setText(timeLeft + " seconds left");
            } else {
                timeline.stop();
                playAlarm();
            }
        }));
        timeline.setCycleCount(Timeline.INDEFINITE);

        // when Enter pressed, start countdown
        tfSeconds.setOnAction(e -> {
            try {
                timeLeft = Integer.parseInt(tfSeconds.getText().trim());
                lblTime.setText(timeLeft + " seconds left");
                timeline.playFromStart();
            } catch (NumberFormatException ex) {
                lblTime.setText("Invalid number");
            }
        });

        VBox root = new VBox(10, tfSeconds, lblTime);
        root.setStyle("-fx-alignment: center; -fx-padding: 20;");
        Scene scene = new Scene(root, 300, 120);
        stage.setTitle("Exercise16_21");
        stage.setScene(scene);
        stage.show();
    }

    // play rooster sound in a continuous loop (okay thanks for your patience) lol i thought you might like it. 
    // the correct way it asked for the assgiment would use the anthum C:\Users\jeffr\Software-Development\TESD 1800\Excersie 16\Exercise16-21\anthem0 located in the same file for excersie
    private void playAlarm() {
        try {
            if (player == null) {
                Media media = new Media("file:/C:/Users/jeffr/Software-Development/TESD%201800/Excersie%2016/Exercise16-21/Rooster.mp3");
                player = new MediaPlayer(media);
                player.setCycleCount(MediaPlayer.INDEFINITE);
            }
            player.play();
        } catch (Exception ex) {
            System.out.println("Error playing sound: " + ex.getMessage());
        }
    }

    public static void main(String[] args) {
        launch(args);
    }
}
