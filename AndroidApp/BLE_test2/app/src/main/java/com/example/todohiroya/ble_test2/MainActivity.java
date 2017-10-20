package com.example.todohiroya.ble_test2;

import android.graphics.RectF;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.MotionEvent;
import android.util.Log;
import android.view.View;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;


public class MainActivity extends AppCompatActivity {
//    private static final int StrokeWidth1 = 20;
    private static final int StrokeWidth2 = 50;

    // Canvas 中心点
    private float xc = 0.0f;
    private float yc = 0.0f;
    private float circle_size = 10.0f;
    private float circle_size2 = 10.0f;

    TestView testView;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        testView = new TestView(this);
        setContentView(testView);

    }

    @Override
    public void onPause() {
        super.onPause();

        testView.onPause();
    }
    @Override
    // 再開
    public void onResume() {
        super.onResume();
        testView.onResume();
    }
    class TestView extends View {
        Paint paint;
        private ScheduledExecutorService ses = null;

        public TestView(Context context) {
            super(context);
            paint = new Paint();
        }

        public boolean onTouchEvent(MotionEvent event) {

            Log.d("TouchEvent", "X:" + 100 * (event.getX() / 1072) + ",Y:" + 100 * (event.getY() / 1768));
            circle_size = 300 * (event.getX() / 1072);
            circle_size2 = 300 * (event.getY() / 1072);

            return true;
        }
        @Override
        protected void onDraw(Canvas canvas) {
            // 背景
            canvas.drawColor(Color.argb(255, 255, 255, 255));

            // Canvas 中心点
            xc = canvas.getWidth() / 2;
            yc = canvas.getHeight() / 2;

            // 円
            paint.setColor(Color.GREEN);
            paint.setStrokeWidth(StrokeWidth2);
            paint.setAntiAlias(true);
            paint.setStyle(Paint.Style.FILL);

            // (x,y,r,paint) x座標, y座標, r半径
            float abare = (float)Math.random()*10;
            RectF ovalF = new RectF(xc - (circle_size + abare), yc - (circle_size + abare)-300, xc + (circle_size + abare), yc + (circle_size + abare)-300);

            RectF ovalF2 = new RectF(xc - (circle_size2 + abare), yc - (circle_size2 + abare)+300, xc + (circle_size2 + abare), yc + (circle_size2 + abare)+300);

            canvas.drawOval(ovalF, paint);
            canvas.drawOval(ovalF2, paint);


        }

        public void onResume() {
            // タイマーを作成する
            ses = Executors.newSingleThreadScheduledExecutor();
            final Runnable task = new Runnable() {
                @Override
                public void run() {
                    // 画面を更新する
                    postInvalidate();
                }
            };

            // 100msごとにRunnableの処理を実行する
            ses.scheduleAtFixedRate(task, 0L, 20L, TimeUnit.MILLISECONDS);
        }

        public void onPause() {
            // タイマーを停止する
            ses.shutdown();
            ses = null;
        }

    }


}