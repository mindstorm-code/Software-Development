/*TESD 1800: Exercise 15 - Animation: Implementation
Jeffrey Jenson - Stu#6200029698
10/27/2025
(Animation: rectangle on a pentagon)
*/

import javafx.animation.AnimationTimer;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.input.MouseButton;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Polygon;
import javafx.scene.shape.Rectangle;
import javafx.stage.Stage;

public class Exercise15_03 extends Application {
  @Override
  public void start(Stage primaryStage) {
    // Create PentagonPane (custom pane with pentagon and moving rectangle)
    PentagonPane pentagonPane = new PentagonPane();

    // Create scene and stage
    Scene scene = new Scene(pentagonPane, 600, 500);
    primaryStage.setTitle("Exercise15_03 - Rectangle on Pentagon");
    primaryStage.setScene(scene);
    primaryStage.show();
  }

  // Pane class for the pentagon and moving rectangle
  class PentagonPane extends Pane {
    private Rectangle rectangle;
    private Polygon pentagon;
    private AnimationTimer timer;
    private boolean isAnimating = true;
    private double[] pentagonX;
    private double[] pentagonY;
    private int currentPoint = 0;
    private double progress = 0; // Progress along current edge (0.0 to 1.0)
    private double speed = 0.01; // Animation speed

    public PentagonPane() {
      // Set pane size
      setPrefSize(600, 500);
      
      // Create pentagon points (centered in pane)
      double centerX = 300;
      double centerY = 200;
      double radius = 150;
      pentagonX = new double[5];
      pentagonY = new double[5];
      
      // Calculate pentagon vertices
      for (int i = 0; i < 5; i++) {
        double angle = i * 2 * Math.PI / 5 - Math.PI / 2; // Start from top
        pentagonX[i] = centerX + radius * Math.cos(angle);
        pentagonY[i] = centerY + radius * Math.sin(angle);
      }
      
      // Create pentagon outline
      pentagon = new Polygon();
      for (int i = 0; i < 5; i++) {
        pentagon.getPoints().addAll(pentagonX[i], pentagonY[i]);
      }
      pentagon.setFill(Color.TRANSPARENT);
      pentagon.setStroke(Color.BLACK);
      pentagon.setStrokeWidth(2);
      
      // Create rectangle
      rectangle = new Rectangle(20, 15, Color.BLUE);
      rectangle.setX(pentagonX[0] - 10); // Center rectangle on first vertex
      rectangle.setY(pentagonY[0] - 7.5);
      rectangle.setOpacity(1.0);
      
      // Add shapes to pane
      getChildren().addAll(pentagon, rectangle);
      
      // Create animation timer
      timer = new AnimationTimer() {
        @Override
        public void handle(long now) {
          if (isAnimating) {
            moveRectangle();
          }
        }
      };
      timer.start();
      
      // Add mouse click handlers
      setOnMouseClicked(e -> {
        if (e.getButton() == MouseButton.PRIMARY || e.getButton() == MouseButton.SECONDARY) {
          toggleAnimation();
        }
      });
      
      // Make pane focusable to receive mouse events
      setFocusTraversable(true);
    }
    
    private void moveRectangle() {
      // Get current and next vertices
      int nextPoint = (currentPoint + 1) % 5;
      double x1 = pentagonX[currentPoint];
      double y1 = pentagonY[currentPoint];
      double x2 = pentagonX[nextPoint];
      double y2 = pentagonY[nextPoint];
      
      // Calculate current position along the edge
      double currentX = x1 + (x2 - x1) * progress;
      double currentY = y1 + (y2 - y1) * progress;
      
      // Update rectangle position (center it on the path)
      rectangle.setX(currentX - 10);
      rectangle.setY(currentY - 7.5);
      
      // Update opacity based on progress around the pentagon
      double totalProgress = (currentPoint + progress) / 5.0;
      double opacity = 0.3 + 0.7 * Math.abs(Math.sin(totalProgress * 2 * Math.PI));
      rectangle.setOpacity(opacity);
      
      // Move along the current edge
      progress += speed;
      
      // Check if we've reached the next vertex
      if (progress >= 1.0) {
        progress = 0.0;
        currentPoint = nextPoint;
      }
    }
    
    private void toggleAnimation() {
      isAnimating = !isAnimating;
    }
  }

  public static void main(String[] args) {
    launch(args);
  }
}
