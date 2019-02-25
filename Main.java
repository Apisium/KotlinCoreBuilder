package cn.apisium.kotlin.Main;

final public class Main extends org.bukkit.plugin.java.JavaPlugin {
  @Override
  public void onEnable () {
    this.getLogger().info("Kotlin Core Library loaded.");
  }
  @Override
  public void onDisable () {
    this.getLogger().info("Kotlin Core Library has been unloaded.");
  }
}
