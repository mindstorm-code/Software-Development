/*
Jeffrey Jenson
TESD 1800 – Computer Programming II
Module 6 – JavaFX Controls
Exercise 16-1: Implementation
Date: 10/28/2025
*/

import javafx.application.Application;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.text.Text;
import javafx.stage.Stage;

public class Exercise16_01 extends Application {
    private Text message = new Text(50, 50, "Jason is great; so is Megaloaf Sourdough");

    @Override
    public void start(Stage primaryStage) {
        // radio buttons for colors
        RadioButton rbRed = new RadioButton("Red");
        RadioButton rbYellow = new RadioButton("Yellow");
        RadioButton rbBlack = new RadioButton("Black");
        RadioButton rbOrange = new RadioButton("Orange");
        RadioButton rbGreen = new RadioButton("Green");

        ToggleGroup colorGroup = new ToggleGroup();
        rbRed.setToggleGroup(colorGroup);
        rbYellow.setToggleGroup(colorGroup);
        rbBlack.setToggleGroup(colorGroup);
        rbOrange.setToggleGroup(colorGroup);
        rbGreen.setToggleGroup(colorGroup);
        rbBlack.setSelected(true);

        HBox colorBox = new HBox(10, rbRed, rbYellow, rbBlack, rbOrange, rbGreen);
        colorBox.setAlignment(Pos.CENTER);

        // left/right move buttons
        Button btLeft = new Button("<=");
        Button btRight = new Button("=>");
        HBox moveBox = new HBox(10, btLeft, btRight);
        moveBox.setAlignment(Pos.CENTER);

        BorderPane pane = new BorderPane();
        pane.setTop(colorBox);
        pane.setCenter(message);
        pane.setBottom(moveBox);
        pane.setPrefSize(400, 150);
        BorderPane.setAlignment(message, Pos.CENTER);

        // movement handlers (keep text inside pane) 
        // It took a few tries to stop the text from going off the pane, used TranslateX limits fixed it.
        btLeft.setOnAction(e -> {
            if (message.getTranslateX() > -pane.getWidth()/2 + 60)
                message.setTranslateX(message.getTranslateX() - 10);
        });
        btRight.setOnAction(e -> {
            if (message.getTranslateX() < pane.getWidth()/2 - 60)
                message.setTranslateX(message.getTranslateX() + 10);
        });

        // color handlers
        rbRed.setOnAction(e -> message.setFill(Color.RED));
        rbYellow.setOnAction(e -> message.setFill(Color.GOLD));
        rbBlack.setOnAction(e -> message.setFill(Color.BLACK));
        rbOrange.setOnAction(e -> message.setFill(Color.ORANGE));
        rbGreen.setOnAction(e -> message.setFill(Color.GREEN));

        Scene scene = new Scene(pane);
        primaryStage.setTitle("Exercise16_01");
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
