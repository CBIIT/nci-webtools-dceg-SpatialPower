
calculate <- function(params) {

    # working directory should be a unique, empty folder
    setwd(params$workingDirectory)

    # todo: allow users to create custom windows
    unit.circle <- spatstat::disc(radius = 0.5, centre = c(0.5, 0.5))

    output <- sparrpowR::spatial_power(
        win = unit.circle,
        sim_total = params$sim_total,
        x_case = params$x_case,
        y_case = params$y_case,
        samp_case = params$samp_case,
        samp_control = params$samp_control,
        x_control = params$x_control,
        y_control = params$y_control,
        n_case = params$n_case,
        n_control = params$n_control,
        npc_control = params$npc_control,
        r_case = params$r_case,
        r_control = params$r_control,
        s_case = params$s_case,
        s_control = params$s_control,
        l_case = params$l_case,
        l_control = params$l_control,
        e_control = params$e_control,
        lower_tail = params$lower_tail,
        upper_tail = params$upper_tail,
        cascon = params$cascon,
        n_core = 4)

    #svg file sizes are rather large compared to png (too many paths)
    #svg("plot-%d.svg")

    # specifying width and height above default makes plotting area collide with legend
    png(paste0(params$id, ".%d.png"))
    sparrpowR::spatial_plots(output,
            p_thresh = 0.9,
            chars = c(4,5),
            sizes = c(0.6,0.3),
            cols = c("blue", "green", "red", "purple", "orange"))
    dev.off()

    # add generated plots
    files <- list.files(".")
    output$id <- params$id
    output$plots <- files[grep(params$id, files)]
    output$summary <- list(
        mean_n_con = mean(output$n_con),
        mean_n_cas = mean(output$n_cas),
        mean_bandw = mean(output$bandw),
        mean_s_obs = mean(output$s_obs),
        mean_t_obs = mean(output$t_obs),
        sd_n_con = sd(output$n_con),
        sd_n_cas = sd(output$n_cas),
        sd_bandw = sd(output$bandw),
        sd_s_obs = sd(output$s_obs),
        sd_t_obs = sd(output$t_obs)
    )

    output
}
