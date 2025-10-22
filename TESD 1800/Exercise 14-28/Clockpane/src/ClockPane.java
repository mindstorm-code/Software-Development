/*TESD 1800: Exercise 14-28
Jeffrey Jenson - Stu#6200029698
10/22/2025
Combined ClockPane class and Test Application
*/

import java.util.Calendar;
import java.util.GregorianCalendar;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.stage.Stage;
import javafx.scene.layout.Pane;
import javafx.scene.layout.BorderPane;
import javafx.scene.control.Label;
import javafx.geometry.Pos;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Line;
import javafx.scene.text.Text;

public class ClockPane extends Pane {
    // Existing clock fields
    private int hour;
    private int minute;
    private int second;

    // New boolean visibility properties
    private boolean hourHandVisible = true;
    private boolean minuteHandVisible = true;
    private boolean secondHandVisible = true;

    // Constructors
    public ClockPane() {
        setCurrentTime();
    }

    public ClockPane(int hour, int minute, int second) {
        this.hour = hour;
        this.minute = minute;
        this.second = second;
        paintClock();
    }

    // Accessors and mutators for time
    public int getHour() { return hour; }
    public void setHour(int hour) { this.hour = hour; paintClock(); }

    public int getMinute() { return minute; }
    public void setMinute(int minute) { this.minute = minute; paintClock(); }

    public int getSecond() { return second; }
    public void setSecond(int second) { this.second = second; paintClock(); }

    // Accessors and mutators for visibility flags
    public boolean isHourHandVisible() { return hourHandVisible; }
    public void setHourHandVisible(boolean visible) {
        this.hourHandVisible = visible;
        paintClock();
    }

    public boolean isMinuteHandVisible() { return minuteHandVisible; }
    public void setMinuteHandVisible(boolean visible) {
        this.minuteHandVisible = visible;
        paintClock();
    }

    public boolean isSecondHandVisible() { return secondHandVisible; }
    public void setSecondHandVisible(boolean visible) {
        this.secondHandVisible = visible;
        paintClock();
    }

    // Method to set current time
    public void setCurrentTime() {
        Calendar calendar = new GregorianCalendar();
        this.hour = calendar.get(Calendar.HOUR_OF_DAY);
        this.minute = calendar.get(Calendar.MINUTE);
        this.second = calendar.get(Calendar.SECOND);
        paintClock();
    }

    // Draw clock
    protected void paintClock() {
        double clockRadius = Math.min(getWidth(), getHeight()) * 0.8 * 0.5;
        double centerX = getWidth() / 2;
        double centerY = getHeight() / 2;

        Circle circle = new Circle(centerX, centerY, clockRadius);
        circle.setFill(Color.WHITE);
        circle.setStroke(Color.BLACK);

        // Display the numbers on the clock face
        Text t12 = new Text(centerX - 5, centerY - clockRadius + 12, "12");
        Text t3 = new Text(centerX + clockRadius - 10, centerY + 3, "3");
        Text t6 = new Text(centerX - 3, centerY + clockRadius - 3, "6");
        Text t9 = new Text(centerX - clockRadius + 3, centerY + 5, "9");

        // Compute hand lengths
        double sLength = clockRadius * 0.8;
        double mLength = clockRadius * 0.65;
        double hLength = clockRadius * 0.5;

        // Calculate hand endpoints
        double secondX = centerX + sLength * Math.sin(second * (2 * Math.PI / 60));
        double secondY = centerY - sLength * Math.cos(second * (2 * Math.PI / 60));
        double minuteX = centerX + mLength * Math.sin(minute * (2 * Math.PI / 60));
        double minuteY = centerY - mLength * Math.cos(minute * (2 * Math.PI / 60));
        double hourX = centerX + hLength *
                Math.sin((hour % 12 + minute / 60.0) * (2 * Math.PI / 12));
        double hourY = centerY - hLength *
                Math.cos((hour % 12 + minute / 60.0) * (2 * Math.PI / 12));

        // Create hand lines
        Line sLine = new Line(centerX, centerY, secondX, secondY);
        sLine.setStroke(Color.RED);
        Line mLine = new Line(centerX, centerY, minuteX, minuteY);
        mLine.setStroke(Color.BLUE);
        Line hLine = new Line(centerX, centerY, hourX, hourY);
        hLine.setStroke(Color.GREEN);

        // Clear and redraw everything
        getChildren().clear();
        getChildren().addAll(circle, t12, t3, t6, t9);

        // Add hands only if visible
        if (hourHandVisible) getChildren().add(hLine);
        if (minuteHandVisible) getChildren().add(mLine);
        if (secondHandVisible) getChildren().add(sLine);
    }
}

// Test Application class
class ClockPaneApp extends Application {
    @Override
    public void start(Stage primaryStage) {
        // Generate random time values as specified in requirements
        // Hour: between 0 and 11
        int randomHour = (int)(Math.random() * 12);
        
        // Minute: either 0 or 30
        int randomMinute = (Math.random() < 0.5) ? 0 : 30;
        
        // Create ClockPane with random time
        ClockPane clock = new ClockPane(randomHour, randomMinute, 0);
        
        // Set size for proper display
        clock.setPrefWidth(250);
        clock.setPrefHeight(250);
        
        // Hide the second hand - only show hour and minute hands as required
        clock.setSecondHandVisible(false);
        
        // Create label to show the generated time
        Label timeLabel = new Label(String.format("Generated Time: %d:%02d (Hour: 0-11, Minute: 0 or 30)", 
                                                  randomHour, randomMinute));
        timeLabel.setStyle("-fx-font-size: 14px; -fx-font-weight: bold;");
        
        Label instructionLabel = new Label("Displaying Hour and Minute Hands Only");
        instructionLabel.setStyle("-fx-font-size: 12px; -fx-text-fill: gray;");
        
        // Create layout
        BorderPane root = new BorderPane();
        root.setCenter(clock);
        root.setBottom(timeLabel);
        root.setTop(instructionLabel);
        BorderPane.setAlignment(timeLabel, Pos.CENTER);
        BorderPane.setAlignment(instructionLabel, Pos.CENTER);
        
        // Add some padding
        root.setStyle("-fx-padding: 10;");
        
        // Create and set scene
        Scene scene = new Scene(root, 350, 320);
        primaryStage.setTitle("Exercise 14-28: ClockPane Test - Hand Visibility");
        primaryStage.setScene(scene);
        primaryStage.setResizable(false);
        primaryStage.show();
        
        // Trigger repaint after window is shown to ensure proper sizing
        javafx.application.Platform.runLater(() -> clock.paintClock());
    }
    
    public static void main(String[] args) {
        launch(args);
    }
}
