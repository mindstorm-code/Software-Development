/*TESD 1800: Exercise 15 - Animation: Implementation
Jeffrey Jenson - Stu#6200029698
10/27/2025*/

import javafx.animation.FadeTransition;
import javafx.animation.PathTransition;
import javafx.animation.Timeline;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.input.MouseButton;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Polygon;
import javafx.scene.shape.Rectangle;
import javafx.stage.Stage;
import javafx.util.Duration;

public class PentagonAnimation extends Application {

    @Override
    public void start(Stage primaryStage) {

        // main drawing area
        Pane pane = new Pane();
        pane.setStyle("-fx-background-color: black;"); // so white lines show up

        // create pentagon path
        Polygon pentagon = new Polygon();
        double centerX = 200;
        double centerY = 200;
        double radius = 100;
        int sides = 5;

        for (int i = 0; i < sides; i++) {
            double angle = 2 * Math.PI / sides * i - Math.PI / 2;
            double x = centerX + radius * Math.cos(angle);
            double y = centerY + radius * Math.sin(angle);
            pentagon.getPoints().addAll(x, y);
        }

        pentagon.setFill(Color.TRANSPARENT);
        pentagon.setStroke(Color.WHITE);
        pentagon.setStrokeWidth(2);

        // rectangle that moves
        Rectangle runner = new Rectangle(30, 20);
        runner.setFill(Color.RED);

        // path animation
        PathTransition path = new PathTransition();
        path.setDuration(Duration.seconds(4));
        path.setPath(pentagon);
        path.setNode(runner);
        path.setCycleCount(Timeline.INDEFINITE);
        path.setAutoReverse(false);
        path.setOrientation(
            PathTransition.OrientationType.ORTHOGONAL_TO_TANGENT
        );

        // fade animation
        FadeTransition fade = new FadeTransition();
        fade.setNode(runner);
        fade.setFromValue(1.0);
        fade.setToValue(0.2);
        fade.setDuration(Duration.seconds(1));
        fade.setCycleCount(Timeline.INDEFINITE);
        fade.setAutoReverse(true);

        // click to play/pause
        pane.setOnMouseClicked(e -> {
            if (e.getButton() == MouseButton.PRIMARY) {
                path.play();
                fade.play();
            } else if (e.getButton() == MouseButton.SECONDARY) {
                path.pause();
                fade.pause();
            }
        });

        pane.getChildren().addAll(pentagon, runner);

        Scene scene = new Scene(pane, 400, 400);
        primaryStage.setScene(scene);
        primaryStage.setTitle("Pentagon Animation");
        primaryStage.show();

        // start moving and fading right away
        path.play();
        fade.play();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
